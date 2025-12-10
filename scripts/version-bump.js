#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const ROOT_DIR = path.resolve(__dirname, '..');
const API_PACKAGE_JSON = path.join(ROOT_DIR, 'api', 'package.json');
const WEB_PACKAGE_JSON = path.join(ROOT_DIR, 'web-app', 'package.json');
const ENVIRONMENT_TS = path.join(ROOT_DIR, 'web-app', 'src', 'environments', 'environment.ts');
const ENVIRONMENT_PROD_TS = path.join(ROOT_DIR, 'web-app', 'src', 'environments', 'environment.production.ts');
const CHANGELOG_PATH = path.join(ROOT_DIR, 'CHANGELOG.md');

// Cores para log
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

// Função para incrementar versão baseada no tipo
function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Tipo de versão inválido: ${type}`);
  }
}

// Função para validar se o CHANGELOG tem conteúdo na seção "Em Desenvolvimento"
function validateChangelog() {
  logStep('1', 'Validando CHANGELOG...');
  
  if (!fs.existsSync(CHANGELOG_PATH)) {
    throw new Error('CHANGELOG.md não encontrado');
  }
  
  const changelogContent = fs.readFileSync(CHANGELOG_PATH, 'utf-8');
  
  // Verifica se existe a seção "Em Desenvolvimento"
  if (!changelogContent.includes('## [Em Desenvolvimento]')) {
    throw new Error('Seção "## [Em Desenvolvimento]" não encontrada no CHANGELOG.md');
  }
  
  // Extrai o conteúdo da seção "Em Desenvolvimento"
  const devSectionMatch = changelogContent.match(/## \[Em Desenvolvimento\](.*?)(?=---|\n## |\Z)/s);
  if (!devSectionMatch) {
    throw new Error('Não foi possível extrair a seção "Em Desenvolvimento" do CHANGELOG.md');
  }
  
  const devSectionContent = devSectionMatch[1].trim();
  
  // Verifica se há conteúdo real (não apenas os templates)
  const hasNewFeatures = devSectionContent.includes('### ✨ Novas Funcionalidades') && 
                         !devSectionContent.match(/### ✨ Novas Funcionalidades\s*-\s*Adicione novas funcionalidades aqui/);
  const hasImprovements = devSectionContent.includes('### 🔧 Melhorias') && 
                         !devSectionContent.match(/### 🔧 Melhorias\s*-\s*Adicione melhorias e otimizações aqui/);
  const hasBugFixes = devSectionContent.includes('### 🐛 Correções') && 
                     !devSectionContent.match(/### 🐛 Correções\s*-\s*Adicione correções de bugs aqui/);
  const hasDependenciesUpdates = devSectionContent.includes('### 📦 Atualizações de Dependências') &&
                          !devSectionContent.match(/### 📦 Atualizações de Dependências\s*-\s*Adicione atualizações de dependências aqui/);
  
  if (!hasNewFeatures && !hasImprovements && !hasBugFixes && !hasDependenciesUpdates) {
    throw new Error('A seção "Em Desenvolvimento" do CHANGELOG.md está vazia ou contém apenas templates. Adicione pelo menos uma mudança antes de fazer o release.');
  }
  
  logSuccess('CHANGELOG validado com sucesso');
  return devSectionContent;
}

// Função para criar branch de backup
function createBackupBranch() {
  logStep('2', 'Criando branch de backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupBranchName = `backup/release-${timestamp}`;
  
  try {
    // Verifica se há mudanças não commitadas
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      logWarning('Há mudanças não commitadas. Fazendo stash...');
      execSync('git stash push -m "Auto-stash before release backup"');
    }
    
    // Cria branch de backup
    execSync(`git checkout -b ${backupBranchName}`);
    execSync('git checkout main');
    
    logSuccess(`Branch de backup criada: ${backupBranchName}`);
    return backupBranchName;
  } catch (error) {
    throw new Error(`Erro ao criar branch de backup: ${error.message}`);
  }
}

// Função para obter versão atual dos package.json
function getCurrentVersion() {
  logStep('3', 'Obtendo versão atual...');
  
  const apiPackage = JSON.parse(fs.readFileSync(API_PACKAGE_JSON, 'utf-8'));
  const webPackage = JSON.parse(fs.readFileSync(WEB_PACKAGE_JSON, 'utf-8'));
  
  if (apiPackage.version !== webPackage.version) {
    throw new Error(`Versões desincronizadas! API: ${apiPackage.version}, Web: ${webPackage.version}`);
  }
  
  logSuccess(`Versão atual: ${apiPackage.version}`);
  return apiPackage.version;
}

// Função para atualizar version nos package.json
function updatePackageVersions(newVersion) {
  logStep('4', 'Atualizando package.json files...');
  
  // API package.json
  const apiPackage = JSON.parse(fs.readFileSync(API_PACKAGE_JSON, 'utf-8'));
  apiPackage.version = newVersion;
  fs.writeFileSync(API_PACKAGE_JSON, JSON.stringify(apiPackage, null, 2) + '\n');
  
  // Web package.json
  const webPackage = JSON.parse(fs.readFileSync(WEB_PACKAGE_JSON, 'utf-8'));
  webPackage.version = newVersion;
  fs.writeFileSync(WEB_PACKAGE_JSON, JSON.stringify(webPackage, null, 2) + '\n');
  
  logSuccess('Package.json files atualizados');
}

// Função para atualizar environment files
function updateEnvironmentFiles(newVersion) {
  logStep('5', 'Atualizando environment files...');
  
  // Environment development
  let envContent = fs.readFileSync(ENVIRONMENT_TS, 'utf-8');
  envContent = envContent.replace(/version:\s*['"][^'"]*['"]/, `version: '${newVersion}'`);
  fs.writeFileSync(ENVIRONMENT_TS, envContent);
  
  // Environment production
  let envProdContent = fs.readFileSync(ENVIRONMENT_PROD_TS, 'utf-8');
  envProdContent = envProdContent.replace(/version:\s*['"][^'"]*['"]/, `version: '${newVersion}'`);
  fs.writeFileSync(ENVIRONMENT_PROD_TS, envProdContent);
  
  logSuccess('Environment files atualizados');
}

// Função para atualizar CHANGELOG
function updateChangelog(newVersion, changelogContent) {
  logStep('6', 'Atualizando CHANGELOG...');

  const currentDate = new Date().toISOString().split('T')[0];
  const fullChangelog = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

  //
  // 1. Pegamos seção completa [Em Desenvolvimento]
  //
  const devSectionRegex = /## \[Em Desenvolvimento\][\s\S]*?---/;
  const devMatch = fullChangelog.match(devSectionRegex);
  if (!devMatch) {
    throw new Error('Seção "Em Desenvolvimento" não encontrada');
  }

  const devSectionFull = devMatch[0];

  //
  // 2. Extraímos somente o conteúdo dentro da seção
  //
  const cleanContent = changelogContent.trim();

  //
  // 3. Remover tópicos vazios (os que ainda têm "Adicione ... aqui")
  //
  const cleanedVersionContent = cleanContent
    .replace(/### ✨ Novas Funcionalidades[\s\S]*?Adicione novas funcionalidades aqui/g, "")
    .replace(/### 🔧 Melhorias[\s\S]*?Adicione melhorias e otimizações aqui/g, "")
    .replace(/### 🐛 Correções[\s\S]*?Adicione correções de bugs aqui/g, "")
    .replace(/### 📦 Atualizações de Dependências[\s\S]*?Adicione atualizações de dependências aqui/g, "")
    // remover blocos vazios após limpeza
    .replace(/### [^\n]+\n*\s*\n/g, "")
    .trim();

  //
  // 4. Se tudo foi removido e não sobrou nada, então não coloca nada na release
  //
  const finalVersionContent = cleanedVersionContent || "*Nenhuma mudança registrada.*";

  //
  // 5. Remove seção Em Desenvolvimento original do changelog
  //
  const changelogWithoutDev = fullChangelog.replace(devSectionRegex, '').trim();

  //
  // 6. Nova seção da versão gerada
  //
  const versionSection =
`## [${newVersion}] - ${currentDate}

${finalVersionContent}

---
`;

  //
  // 7. Recriar seção "Em Desenvolvimento" limpa
  //
  const newDevSection =
`## [Em Desenvolvimento]

### ✨ Novas Funcionalidades
- Adicione novas funcionalidades aqui

### 🔧 Melhorias
- Adicione melhorias e otimizações aqui

### 🐛 Correções
- Adicione correções de bugs aqui

### 📦 Atualizações de Dependências
- Adicione atualizações de dependências aqui

---
`;

  //
  // 8. Montar changelog final
  //
  const finalChangelog =
`${newDevSection}
${versionSection}
${changelogWithoutDev}
`.trim() + '\n';

  fs.writeFileSync(CHANGELOG_PATH, finalChangelog);

  logSuccess('CHANGELOG atualizado (tópicos vazios removidos da versão gerada)');
}


// Função para extrair release notes do changelog
function extractReleaseNotes(changelogContent) {
  logStep('7', 'Extraindo release notes...');
  
  // Remove linhas vazias e limpa o conteúdo
  const cleanContent = changelogContent
    .split('\n')
    .filter(line => line.trim() && !line.includes('Adicione'))
    .join('\n')
    .trim();
  
  return cleanContent || 'Release notes não disponíveis';
}

// Função para agendar limpeza da branch de backup
function scheduleBackupCleanup(backupBranchName) {
  logStep('8', 'Agendando limpeza de backup...');
  
  // Cria um script para deletar a branch após 24h
  const cleanupScript = `#!/bin/bash
sleep 86400 # 24 hours
git branch -D ${backupBranchName} 2>/dev/null || true
echo "Backup branch ${backupBranchName} removed after 24h retention period"
`;
  
  const cleanupScriptPath = path.join(ROOT_DIR, 'scripts', 'cleanup-backup.sh');
  fs.writeFileSync(cleanupScriptPath, cleanupScript);
  fs.chmodSync(cleanupScriptPath, '755');
  
  // Executa o script em background (funciona em sistemas Unix-like)
  try {
    if (process.platform !== 'win32') {
      execSync(`nohup ${cleanupScriptPath} &`, { stdio: 'ignore' });
      logSuccess(`Limpeza de backup agendada para 24h (branch: ${backupBranchName})`);
    } else {
      logWarning('Limpeza automática de backup não suportada no Windows. Remova manualmente após 24h.');
    }
  } catch (error) {
    logWarning(`Não foi possível agendar limpeza automática: ${error.message}`);
  }
}

// Função principal
function main() {
  try {
    log('\n🚀 Iniciando processo de bump de versão...\n', 'magenta');
    
    // Verifica argumentos
    const versionType = process.argv[2];
    if (!versionType || !['major', 'minor', 'patch'].includes(versionType)) {
      throw new Error('Uso: node version-bump.js <major|minor|patch>');
    }
    
    log(`📋 Tipo de versão selecionado: ${versionType.toUpperCase()}`, 'blue');
    
    // Executa passos do processo
    const changelogContent = validateChangelog();
    const backupBranchName = createBackupBranch();
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, versionType);
    
    log(`\n🔄 Atualizando versão: ${currentVersion} → ${newVersion}\n`, 'yellow');
    
    updatePackageVersions(newVersion);
    updateEnvironmentFiles(newVersion);
    updateChangelog(newVersion, changelogContent);
    const releaseNotes = extractReleaseNotes(changelogContent);
    scheduleBackupCleanup(backupBranchName);
    
    // Salva informações para o workflow do GitHub
    const outputFile = path.join(ROOT_DIR, 'release-info.json');
    const releaseInfo = {
      oldVersion: currentVersion,
      newVersion: newVersion,
      versionType: versionType,
      releaseNotes: releaseNotes,
      backupBranch: backupBranchName,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(releaseInfo, null, 2));
    
    log('\n🎉 Processo de bump de versão concluído com sucesso!\n', 'green');
    log(`📦 Nova versão: ${newVersion}`, 'green');
    log(`🔒 Branch de backup: ${backupBranchName}`, 'green');
    log(`📄 Informações salvas em: release-info.json`, 'green');
    
  } catch (error) {
    logError(`\nErro durante o processo: ${error.message}`);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  incrementVersion,
  validateChangelog,
  createBackupBranch,
  getCurrentVersion,
  updatePackageVersions,
  updateEnvironmentFiles,
  updateChangelog,
  extractReleaseNotes,
  scheduleBackupCleanup
};