-- Script SQL para corrigir o problema de cascade delete
-- Execute este script diretamente no banco PostgreSQL se o problema persistir

-- 1. Primeiro, remover o constraint existente
ALTER TABLE installments DROP CONSTRAINT IF EXISTS "FK_077e97cf46c9ed2225d05263a23";

-- 2. Recriar o constraint com CASCADE DELETE
ALTER TABLE installments 
ADD CONSTRAINT "FK_077e97cf46c9ed2225d05263a23" 
FOREIGN KEY ("installmentPlanId") 
REFERENCES installment_plans(id) 
ON DELETE CASCADE;

-- 3. Verificar se o constraint foi criado corretamente
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'installments'
    AND kcu.column_name = 'installmentPlanId';