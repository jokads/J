#!/bin/bash

# ================================================
# SCRIPT DE TESTE DA API WOOCOMMERCE
# ================================================
# 
# Testa se a API REST do WooCommerce está funcional
# 
# USO:
#   chmod +x test-woocommerce-api.sh
#   ./test-woocommerce-api.sh

# ===== CONFIGURAÇÃO =====
STORE_URL="${WC_STORE_URL:-https://store.joka.ct.ws}"
CONSUMER_KEY="${WC_CONSUMER_KEY:-ck_XXXXX}"
CONSUMER_SECRET="${WC_CONSUMER_SECRET:-cs_XXXXX}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== FUNÇÕES HELPER =====
print_header() {
    echo ""
    echo "================================================"
    echo "$1"
    echo "================================================"
}

print_test() {
    echo ""
    echo -e "${BLUE}🧪 TESTE:${NC} $1"
    echo "---"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ===== VALIDAR CONFIGURAÇÃO =====
validate_config() {
    local errors=0
    
    if [[ "$CONSUMER_KEY" == "ck_XXXXX" ]]; then
        print_error "Consumer Key não configurado!"
        echo "   Define: export WC_CONSUMER_KEY=ck_xxxxx"
        errors=$((errors + 1))
    fi
    
    if [[ "$CONSUMER_SECRET" == "cs_XXXXX" ]]; then
        print_error "Consumer Secret não configurado!"
        echo "   Define: export WC_CONSUMER_SECRET=cs_xxxxx"
        errors=$((errors + 1))
    fi
    
    if [[ $errors -gt 0 ]]; then
        echo ""
        print_warning "EXEMPLO DE USO:"
        echo "   export WC_STORE_URL=https://store.joka.ct.ws"
        echo "   export WC_CONSUMER_KEY=ck_0be3db85c942bdda38a266f87572326122cddd55"
        echo "   export WC_CONSUMER_SECRET=cs_7492e03fc675a317e769e528eec63322dd5e87ce"
        echo "   ./test-woocommerce-api.sh"
        echo ""
        exit 1
    fi
}

# ===== TESTES =====

# Teste 1: WordPress REST API base
test_wordpress_api() {
    print_test "1. WordPress REST API Base"
    
    local response=$(curl -s -w "\n%{http_code}" "${STORE_URL}/wp-json/")
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    echo "URL: ${STORE_URL}/wp-json/"
    echo "Status HTTP: $status"
    
    if [[ "$status" == "200" ]]; then
        print_success "WordPress REST API está ativo!"
        echo "Namespaces disponíveis:"
        echo "$body" | grep -o '"namespaces":\[.*\]' | head -c 200
        echo ""
        return 0
    else
        print_error "WordPress REST API não responde corretamente!"
        echo "Response: $body"
        return 1
    fi
}

# Teste 2: WooCommerce API root
test_woocommerce_root() {
    print_test "2. WooCommerce API Root"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -u "${CONSUMER_KEY}:${CONSUMER_SECRET}" \
        "${STORE_URL}/wp-json/wc/v3/")
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    echo "URL: ${STORE_URL}/wp-json/wc/v3/"
    echo "Status HTTP: $status"
    
    if [[ "$status" == "200" ]]; then
        print_success "WooCommerce API está ativo!"
        return 0
    else
        print_error "WooCommerce API não responde!"
        echo "Response: $body"
        return 1
    fi
}

# Teste 3: Listar produtos
test_list_products() {
    print_test "3. Listar Produtos (GET /products)"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -u "${CONSUMER_KEY}:${CONSUMER_SECRET}" \
        "${STORE_URL}/wp-json/wc/v3/products?per_page=5")
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    echo "URL: ${STORE_URL}/wp-json/wc/v3/products?per_page=5"
    echo "Status HTTP: $status"
    
    if [[ "$status" == "200" ]]; then
        local count=$(echo "$body" | grep -o '"id":[0-9]*' | wc -l)
        print_success "Listagem de produtos funciona! ($count produtos retornados)"
        
        if [[ $count -gt 0 ]]; then
            echo ""
            echo "Primeiros produtos:"
            echo "$body" | grep -o '"name":"[^"]*"' | head -n 5
        fi
        return 0
    else
        print_error "Erro ao listar produtos!"
        echo "Response: $body"
        return 1
    fi
}

# Teste 4: CORS Headers
test_cors_headers() {
    print_test "4. CORS Headers"
    
    local response=$(curl -s -I -X OPTIONS \
        -H "Origin: https://joka.ct.ws" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Authorization" \
        "${STORE_URL}/wp-json/wc/v3/products")
    
    echo "Origin testado: https://joka.ct.ws"
    echo ""
    echo "Headers recebidos:"
    echo "$response" | grep -i "access-control"
    
    if echo "$response" | grep -qi "access-control-allow-origin"; then
        print_success "CORS Headers configurados!"
        return 0
    else
        print_warning "CORS Headers não encontrados!"
        echo "Isto pode causar problemas no frontend!"
        echo ""
        echo "SOLUÇÃO: Adiciona no wp-config.php:"
        echo "header('Access-Control-Allow-Origin: https://joka.ct.ws');"
        return 1
    fi
}

# Teste 5: Criar produto de teste (se tiver permissões Write)
test_create_product() {
    print_test "5. Criar Produto de Teste (POST /products)"
    
    local product_data='{
        "name": "Produto Teste API",
        "type": "simple",
        "regular_price": "99.99",
        "description": "Produto criado por teste automático da API",
        "short_description": "Teste API",
        "sku": "TEST-'$(date +%s)'",
        "manage_stock": true,
        "stock_quantity": 10
    }'
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -u "${CONSUMER_KEY}:${CONSUMER_SECRET}" \
        -H "Content-Type: application/json" \
        -d "$product_data" \
        "${STORE_URL}/wp-json/wc/v3/products")
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    echo "Status HTTP: $status"
    
    if [[ "$status" == "201" ]]; then
        local product_id=$(echo "$body" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
        print_success "Produto criado com sucesso! ID: $product_id"
        
        # Tentar deletar o produto de teste
        print_warning "A remover produto de teste..."
        curl -s -X DELETE \
            -u "${CONSUMER_KEY}:${CONSUMER_SECRET}" \
            "${STORE_URL}/wp-json/wc/v3/products/${product_id}?force=true" > /dev/null
        echo "Produto de teste removido."
        
        return 0
    else
        print_error "Erro ao criar produto!"
        echo "Response: $body"
        
        if echo "$body" | grep -qi "consumer_key"; then
            print_warning "Possível problema: Chaves API inválidas!"
        fi
        if echo "$body" | grep -qi "permission"; then
            print_warning "Possível problema: Chaves API sem permissões Write!"
        fi
        
        return 1
    fi
}

# Teste 6: Categorias
test_categories() {
    print_test "6. Listar Categorias (GET /products/categories)"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -u "${CONSUMER_KEY}:${CONSUMER_SECRET}" \
        "${STORE_URL}/wp-json/wc/v3/products/categories?per_page=10")
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    echo "Status HTTP: $status"
    
    if [[ "$status" == "200" ]]; then
        local count=$(echo "$body" | grep -o '"id":[0-9]*' | wc -l)
        print_success "Listagem de categorias funciona! ($count categorias)"
        
        if [[ $count -gt 0 ]]; then
            echo ""
            echo "Categorias encontradas:"
            echo "$body" | grep -o '"name":"[^"]*"' | head -n 10
        fi
        return 0
    else
        print_error "Erro ao listar categorias!"
        return 1
    fi
}

# Teste 7: Informações da loja
test_store_info() {
    print_test "7. Informações da Loja (GET /system_status)"
    
    local response=$(curl -s -w "\n%{http_code}" \
        -u "${CONSUMER_KEY}:${CONSUMER_SECRET}" \
        "${STORE_URL}/wp-json/wc/v3/system_status")
    
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    echo "Status HTTP: $status"
    
    if [[ "$status" == "200" ]]; then
        print_success "Informações da loja obtidas!"
        
        echo ""
        echo "Detalhes:"
        echo "$body" | grep -o '"version":"[^"]*"' | head -n 3
        echo "$body" | grep -o '"currency":"[^"]*"'
        echo "$body" | grep -o '"permalink_structure":"[^"]*"'
        
        # Verificar permalink structure
        if echo "$body" | grep -q '"permalink_structure":"\\/%postname%\\/"'; then
            print_success "Permalinks configurados corretamente (/%postname%/)"
        else
            print_warning "Permalinks podem não estar configurados como 'Post name'"
            echo "AÇÃO: Vai em WordPress Admin → Settings → Permalinks → Post name"
        fi
        
        return 0
    else
        print_warning "Não foi possível obter informações do sistema"
        return 1
    fi
}

# ===== MAIN =====
main() {
    print_header "🧪 TESTE DA API WOOCOMMERCE - JOKATECH"
    
    echo "Loja: $STORE_URL"
    echo "Consumer Key: ${CONSUMER_KEY:0:20}..."
    echo "Consumer Secret: ${CONSUMER_SECRET:0:20}..."
    
    # Validar configuração
    validate_config
    
    # Executar testes
    local total_tests=7
    local passed=0
    
    test_wordpress_api && passed=$((passed + 1))
    test_woocommerce_root && passed=$((passed + 1))
    test_list_products && passed=$((passed + 1))
    test_cors_headers && passed=$((passed + 1))
    test_create_product && passed=$((passed + 1))
    test_categories && passed=$((passed + 1))
    test_store_info && passed=$((passed + 1))
    
    # Resultado final
    print_header "📊 RESULTADO FINAL"
    
    echo "Testes passados: $passed/$total_tests"
    echo ""
    
    if [[ $passed -eq $total_tests ]]; then
        print_success "TODOS OS TESTES PASSARAM! 🎉"
        echo ""
        echo "A API WooCommerce está 100% funcional!"
        echo "Podes agora:"
        echo "  1. Importar produtos: node import-products.js --apply"
        echo "  2. Conectar o dashboard: Adiciona as chaves em /admin"
        exit 0
    elif [[ $passed -ge $((total_tests - 1)) ]]; then
        print_warning "QUASE LÁ! $passed/$total_tests testes passaram"
        echo ""
        echo "Revê os erros acima e corrige as configurações."
        exit 1
    else
        print_error "MÚLTIPLOS PROBLEMAS ENCONTRADOS!"
        echo ""
        echo "Revê a instalação do WordPress/WooCommerce:"
        echo "  1. Permalinks em 'Post name'"
        echo "  2. CORS configurado no wp-config.php"
        echo "  3. Chaves API com permissões Read/Write"
        exit 1
    fi
}

# Executar
main
