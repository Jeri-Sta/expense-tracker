import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  template: `
    <div class="layout-wrapper">
      <router-outlet></router-outlet>
    </div>
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Personal Expense Tracker';

  constructor(private readonly primengConfig: PrimeNGConfig) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.primengConfig.zIndex = {
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100
    };
    
    // Configurar tradução para português brasileiro
    this.primengConfig.setTranslation({
      // Botões de confirmação
      accept: 'Sim',
      reject: 'Não',
      cancel: 'Cancelar',
      clear: 'Limpar',
      apply: 'Aplicar',
      
      // Upload/Arquivo
      choose: 'Escolher',
      upload: 'Enviar',
      
      // Calendário
      today: 'Hoje',
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      weekHeader: 'Sem',
      firstDayOfWeek: 0,
      dateFormat: 'dd/mm/yy',
      
      // Filtros e buscas
      startsWith: 'Inicia com',
      contains: 'Contém',
      notContains: 'Não contém',
      endsWith: 'Termina com',
      equals: 'Igual',
      notEquals: 'Não igual',
      noFilter: 'Sem filtro',
      lt: 'Menor que',
      lte: 'Menor que ou igual',
      gt: 'Maior que',
      gte: 'Maior que ou igual',
      is: 'É',
      isNot: 'Não é',
      before: 'Antes',
      after: 'Depois',
      matchAll: 'Corresponder todos',
      matchAny: 'Corresponder qualquer',
      addRule: 'Adicionar regra',
      removeRule: 'Remover regra',
      
      // Senhas
      weak: 'Fraco',
      medium: 'Médio',
      strong: 'Forte',
      passwordPrompt: 'Digite uma senha',
      
      // Mensagens vazias
      emptyMessage: 'Nenhum resultado encontrado',
      emptyFilterMessage: 'Nenhum resultado encontrado'
    });
  }
}