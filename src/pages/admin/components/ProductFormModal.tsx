import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface ProductFormModalProps {
  darkMode: boolean;
  product: any;
  onClose: () => void;
  onSave: () => void;
}

// ✅ Lista completa de países (mesma do TaxManagement)
const COUNTRIES_WITH_VAT = [
  // Europa
  { name: 'Portugal', code: 'PT', defaultVat: 23, reducedVat: [13, 6] },
  { name: 'Espanha', code: 'ES', defaultVat: 21, reducedVat: [10, 4] },
  { name: 'França', code: 'FR', defaultVat: 20, reducedVat: [10, 5.5, 2.1] },
  { name: 'Alemanha', code: 'DE', defaultVat: 19, reducedVat: [7] },
  { name: 'Itália', code: 'IT', defaultVat: 22, reducedVat: [10, 5, 4] },
  { name: 'Bélgica', code: 'BE', defaultVat: 21, reducedVat: [12, 6] },
  { name: 'Holanda', code: 'NL', defaultVat: 21, reducedVat: [9] },
  { name: 'Luxemburgo', code: 'LU', defaultVat: 17, reducedVat: [14, 8, 3] },
  { name: 'Áustria', code: 'AT', defaultVat: 20, reducedVat: [13, 10] },
  { name: 'Grécia', code: 'GR', defaultVat: 24, reducedVat: [13, 6] },
  { name: 'Polónia', code: 'PL', defaultVat: 23, reducedVat: [8, 5] },
  { name: 'República Checa', code: 'CZ', defaultVat: 21, reducedVat: [15, 10] },
  { name: 'Hungria', code: 'HU', defaultVat: 27, reducedVat: [18, 5] },
  { name: 'Roménia', code: 'RO', defaultVat: 19, reducedVat: [9, 5] },
  { name: 'Bulgária', code: 'BG', defaultVat: 20, reducedVat: [9] },
  { name: 'Croácia', code: 'HR', defaultVat: 25, reducedVat: [13, 5] },
  { name: 'Eslováquia', code: 'SK', defaultVat: 20, reducedVat: [10] },
  { name: 'Eslovénia', code: 'SI', defaultVat: 22, reducedVat: [9.5] },
  { name: 'Estónia', code: 'EE', defaultVat: 20, reducedVat: [9] },
  { name: 'Letónia', code: 'LV', defaultVat: 21, reducedVat: [12, 5] },
  { name: 'Lituânia', code: 'LT', defaultVat: 21, reducedVat: [9, 5] },
  { name: 'Dinamarca', code: 'DK', defaultVat: 25, reducedVat: [] },
  { name: 'Suécia', code: 'SE', defaultVat: 25, reducedVat: [12, 6] },
  { name: 'Finlândia', code: 'FI', defaultVat: 24, reducedVat: [14, 10] },
  { name: 'Irlanda', code: 'IE', defaultVat: 23, reducedVat: [13.5, 9, 4.8] },
  { name: 'Chipre', code: 'CY', defaultVat: 19, reducedVat: [9, 5] },
  { name: 'Malta', code: 'MT', defaultVat: 18, reducedVat: [7, 5] },
  { name: 'Reino Unido', code: 'GB', defaultVat: 20, reducedVat: [5] },
  { name: 'Suíça', code: 'CH', defaultVat: 7.7, reducedVat: [3.7, 2.5] },
  { name: 'Noruega', code: 'NO', defaultVat: 25, reducedVat: [15, 12] },
  { name: 'Islândia', code: 'IS', defaultVat: 24, reducedVat: [11] },
  
  // América do Norte
  { name: 'Estados Unidos', code: 'US', defaultVat: 0, reducedVat: [] },
  { name: 'Canadá', code: 'CA', defaultVat: 5, reducedVat: [] },
  { name: 'México', code: 'MX', defaultVat: 16, reducedVat: [8] },
  
  // América do Sul
  { name: 'Brasil', code: 'BR', defaultVat: 17, reducedVat: [12, 7] },
  { name: 'Argentina', code: 'AR', defaultVat: 21, reducedVat: [10.5] },
  { name: 'Chile', code: 'CL', defaultVat: 19, reducedVat: [] },
  { name: 'Colômbia', code: 'CO', defaultVat: 19, reducedVat: [5] },
  { name: 'Peru', code: 'PE', defaultVat: 18, reducedVat: [] },
  { name: 'Uruguai', code: 'UY', defaultVat: 22, reducedVat: [10] },
  
  // Ásia
  { name: 'China', code: 'CN', defaultVat: 13, reducedVat: [9, 6] },
  { name: 'Japão', code: 'JP', defaultVat: 10, reducedVat: [8] },
  { name: 'Coreia do Sul', code: 'KR', defaultVat: 10, reducedVat: [] },
  { name: 'Índia', code: 'IN', defaultVat: 18, reducedVat: [12, 5] },
  { name: 'Singapura', code: 'SG', defaultVat: 8, reducedVat: [] },
  { name: 'Tailândia', code: 'TH', defaultVat: 7, reducedVat: [] },
  { name: 'Malásia', code: 'MY', defaultVat: 0, reducedVat: [] },
  { name: 'Indonésia', code: 'ID', defaultVat: 11, reducedVat: [] },
  { name: 'Filipinas', code: 'PH', defaultVat: 12, reducedVat: [] },
  { name: 'Vietname', code: 'VN', defaultVat: 10, reducedVat: [5] },
  
  // Oceania
  { name: 'Austrália', code: 'AU', defaultVat: 10, reducedVat: [] },
  { name: 'Nova Zelândia', code: 'NZ', defaultVat: 15, reducedVat: [] },
  
  // África
  { name: 'África do Sul', code: 'ZA', defaultVat: 15, reducedVat: [] },
  { name: 'Marrocos', code: 'MA', defaultVat: 20, reducedVat: [14, 10, 7] },
  { name: 'Egito', code: 'EG', defaultVat: 14, reducedVat: [] },
  { name: 'Nigéria', code: 'NG', defaultVat: 7.5, reducedVat: [] },
  { name: 'Quénia', code: 'KE', defaultVat: 16, reducedVat: [] },
  
  // Médio Oriente
  { name: 'Emirados Árabes Unidos', code: 'AE', defaultVat: 5, reducedVat: [] },
  { name: 'Arábia Saudita', code: 'SA', defaultVat: 15, reducedVat: [] },
  { name: 'Israel', code: 'IL', defaultVat: 17, reducedVat: [] },
  { name: 'Turquia', code: 'TR', defaultVat: 18, reducedVat: [8, 1] },
  
  // Outros
  { name: 'Rússia', code: 'RU', defaultVat: 20, reducedVat: [10] },
  { name: 'Ucrânia', code: 'UA', defaultVat: 20, reducedVat: [7] },
];

export default function ProductFormModal({ darkMode, product, onClose, onSave }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    cost: 0,
    promotional_price: 0,
    category_id: '',
    stock: 0,
    min_stock: 5,
    sku: '',
    barcode: '',
    weight: 0,
    dimensions: '',
    status: 'active',
    type: 'physical',
    tax_rate: 23,
    tax_enabled: true,
    tax_country: 'Portugal',
    country_origin: '',
    warehouse_location: '',
    is_dropshipping: false,
    supplier_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    tags: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [globalVatEnabled, setGlobalVatEnabled] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadTaxRules();
    loadGlobalVatSetting();
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || 0,
        cost: product.cost || 0,
        promotional_price: product.promotional_price || 0,
        category_id: product.category_id || '',
        stock: product.stock || 0,
        min_stock: product.min_stock || 5,
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        status: product.status || 'active',
        type: product.type || 'physical',
        tax_rate: product.tax_rate || 23,
        tax_enabled: product.tax_enabled !== false,
        tax_country: product.tax_country || 'Portugal',
        country_origin: product.country_origin || '',
        warehouse_location: product.warehouse_location || '',
        is_dropshipping: product.is_dropshipping || false,
        supplier_id: product.supplier_id || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        meta_keywords: product.meta_keywords || '',
        tags: product.tags || '',
      });
      setImages(product.images || []);
      setVariants(product.variants || []);
    }
  }, [product]);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const loadTaxRules = async () => {
    const { data } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('is_active', true)
      .order('country');
    setTaxRules(data || []);
  };

  const loadGlobalVatSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'global_vat_enabled')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setGlobalVatEnabled(data?.value === 'true' || data?.value === true);
    } catch (error) {
      console.error('Erro ao carregar configuração global de IVA:', error);
    }
  };

  // ✅ NOVO: Calcular preço FINAL que será mostrado ao cliente
  const calculateFinalPrice = (basePrice: number) => {
    if (!globalVatEnabled || !formData.tax_enabled || formData.tax_rate === 0) {
      return basePrice;
    }
    return basePrice * (1 + formData.tax_rate / 100);
  };

  // ✅ NOVO: Verificar se deve mostrar "IVA incluído"
  const shouldShowVatIncluded = () => {
    return globalVatEnabled && formData.tax_enabled && formData.tax_rate > 0;
  };

  const handleCountryChange = (country: string) => {
    const countryData = COUNTRIES_WITH_VAT.find(c => c.name === country);
    if (countryData) {
      setFormData({
        ...formData,
        tax_country: country,
        tax_rate: countryData.defaultVat,
      });
    }
  };

  const getAvailableTaxRates = () => {
    const countryData = COUNTRIES_WITH_VAT.find(c => c.name === formData.tax_country);
    if (!countryData) return [];
    
    const rates = [
      { value: countryData.defaultVat, label: `${countryData.defaultVat}% - ${countryData.name} (Padrão)` }
    ];
    
    countryData.reducedVat.forEach(rate => {
      rates.push({ value: rate, label: `${rate}% - ${countryData.name} (Reduzida)` });
    });
    
    rates.push({ value: 0, label: '0% - Isento' });
    
    return rates;
  };

  // ✅ NOVO: Adicionar imagem
  const handleAddImage = () => {
    if (imageInput.trim() && images.length < 10) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  // ✅ NOVO: Remover imagem
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ✅ NOVO: Reordenar imagens
  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < images.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        images,
        variants,
        margin: formData.price - formData.cost,
        margin_percentage: ((formData.price - formData.cost) / formData.price * 100).toFixed(2),
        updated_at: new Date().toISOString(),
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }

      alert('✅ Produto salvo com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('❌ Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} p-6 flex items-center justify-between z-10`}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="ri-box-3-line text-yellow-500"></i>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* ✅ Alerta se IVA estiver desativado globalmente */}
          {!globalVatEnabled && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="ri-alert-line text-red-500 text-xl mt-0.5"></i>
                <div>
                  <h3 className="font-bold text-red-500">⚠️ IVA/TVA Desativado Globalmente</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    O IVA está desativado globalmente. Nenhum imposto será calculado mesmo que ative neste produto.
                    Vá para a aba "Impostos" para ativar o IVA globalmente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NOVO: Galeria de Imagens Profissional */}
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <i className="ri-image-line text-yellow-500"></i>
              Galeria de Imagens (até 10 fotos)
            </h3>

            {/* Grid de Imagens */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-40 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
                      <img
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                          Principal
                        </div>
                      )}
                    </div>
                    
                    {/* Controles */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'up')}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Mover para esquerda"
                        >
                          <i className="ri-arrow-left-line text-white"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <i className="ri-delete-bin-line text-white"></i>
                      </button>
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 'down')}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Mover para direita"
                        >
                          <i className="ri-arrow-right-line text-white"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar Nova Imagem */}
            {images.length < 10 && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="Cole o URL da imagem aqui..."
                  className={`flex-1 px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!imageInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  Adicionar
                </button>
              </div>
            )}

            <p className="text-sm text-gray-400 mt-3">
              <i className="ri-information-line mr-1"></i>
              {images.length}/10 imagens • A primeira imagem será a principal • Arraste para reordenar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <i className="ri-information-line text-yellow-500"></i>
                  Informações Básicas
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                      }}
                      placeholder="Ex: iPhone 15 Pro Max 256GB"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="iphone-15-pro-max-256gb"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Descrição Curta</label>
                    <textarea
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      rows={3}
                      placeholder="Resumo rápido do produto (aparece nos cards)"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Descrição Completa</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={8}
                      placeholder="Descrição detalhada do produto com todas as características..."
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      <i className="ri-lightbulb-line mr-1"></i>
                      Dica: Use HTML para formatação (negrito, listas, etc.)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Categoria *</label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      >
                        <option value="">Selecione...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      >
                        <option value="active">✅ Ativo</option>
                        <option value="inactive">❌ Inativo</option>
                        <option value="draft">📝 Rascunho</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Tipo</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      >
                        <option value="physical">📦 Físico</option>
                        <option value="digital">💾 Digital</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="SKU-12345"
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Estoque & Logística */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <i className="ri-stack-line text-yellow-500"></i>
                  Estoque & Logística
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Estoque Atual *</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg font-bold`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Estoque Mínimo</label>
                      <input
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Localização no Armazém</label>
                    <input
                      type="text"
                      value={formData.warehouse_location}
                      onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                      placeholder="Ex: Corredor A, Prateleira 12, Posição 3"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                        placeholder="0.50"
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Dimensões (LxAxP cm)</label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        placeholder="30x20x10"
                        className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">País de Origem</label>
                    <select
                      value={formData.country_origin}
                      onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    >
                      <option value="">Selecione o país de origem...</option>
                      {COUNTRIES_WITH_VAT.map(country => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_dropshipping"
                      checked={formData.is_dropshipping}
                      onChange={(e) => setFormData({ ...formData, is_dropshipping: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 cursor-pointer"
                    />
                    <label htmlFor="is_dropshipping" className="text-sm font-bold cursor-pointer">
                      📦 Produto Dropshipping
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* ✅ MELHORADO: Preços & IVA Super Profissional */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <i className="ri-money-euro-circle-line text-yellow-500"></i>
                  Preços & Financeiro
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Custo (sem IVA) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.cost}
                          onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg font-bold`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Preço Venda (sem IVA) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg font-bold`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Preço Promocional (sem IVA)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.promotional_price}
                        onChange={(e) => setFormData({ ...formData, promotional_price: parseFloat(e.target.value) || 0 })}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg font-bold`}
                      />
                    </div>
                  </div>

                  {/* ✅ SUPER MELHORADO: Controle de IVA */}
                  <div className={`p-5 rounded-xl border-2 ${
                    globalVatEnabled && formData.tax_enabled 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-red-500/50 bg-red-500/5'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-base font-bold flex items-center gap-2">
                        <i className="ri-percent-line text-2xl text-yellow-500"></i>
                        IVA/TVA neste Produto
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tax_enabled: !formData.tax_enabled })}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                          formData.tax_enabled ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        disabled={!globalVatEnabled}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            formData.tax_enabled ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {formData.tax_enabled && globalVatEnabled ? (
                      <div className="space-y-4">
                        {/* Seleção de País */}
                        <div>
                          <label className="block text-sm font-bold mb-2">País para IVA</label>
                          <select
                            value={formData.tax_country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold`}
                          >
                            {COUNTRIES_WITH_VAT.map(country => (
                              <option key={country.code} value={country.name}>
                                {country.name} ({country.code}) - {country.defaultVat}%
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Seleção de Taxa */}
                        <div>
                          <label className="block text-sm font-bold mb-2">Taxa IVA (%)</label>
                          <select
                            value={formData.tax_rate}
                            onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                            className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold`}
                          >
                            {getAvailableTaxRates().map(rate => (
                              <option key={rate.value} value={rate.value}>
                                {rate.label}
                              </option>
                            ))}
                            {taxRules
                              .filter(rule => rule.country === formData.tax_country)
                              .map(rule => (
                                <option key={rule.id} value={rule.rate}>
                                  {rule.rate}% - {rule.name}
                                </option>
                              ))
                            }
                          </select>
                        </div>

                        {/* ✅ NOVO: Breakdown Profissional */}
                        <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Preço sem IVA:</span>
                            <span className="text-lg font-bold">€{formData.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">IVA ({formData.tax_rate}%):</span>
                            <span className="text-lg font-bold text-yellow-500">
                              +€{(formData.price * formData.tax_rate / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="h-px bg-gray-700"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold">Preço FINAL ao Cliente:</span>
                            <span className="text-2xl font-bold text-green-500">
                              €{calculateFinalPrice(formData.price).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-center text-green-400 font-bold">
                            ✅ IVA incluído no preço
                          </div>
                        </div>

                        {/* Info */}
                        <div className="text-xs text-gray-400 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                          <i className="ri-information-line mr-1"></i>
                          <strong>Este é o preço que o cliente verá no site:</strong> €{calculateFinalPrice(formData.price).toFixed(2)} (IVA incluído)
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-red-500 flex items-center gap-2 p-3 bg-red-500/10 rounded-lg">
                        <i className="ri-alert-fill text-xl"></i>
                        <div>
                          <p className="font-bold">
                            {!globalVatEnabled 
                              ? 'IVA desativado globalmente' 
                              : 'IVA desativado para este produto'}
                          </p>
                          <p className="text-xs mt-1">
                            O cliente verá: €{formData.price.toFixed(2)} (sem menção de IVA)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Margem */}
                  {formData.price > 0 && formData.cost > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">Margem de Lucro:</span>
                        <span className="text-xl font-bold text-green-500">€{(formData.price - formData.cost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">Margem %:</span>
                        <span className="text-xl font-bold text-green-500">
                          {((formData.price - formData.cost) / formData.price * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO & Meta Tags */}
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <i className="ri-seo-line text-yellow-500"></i>
                  SEO & Meta Tags
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Meta Título</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      maxLength={60}
                      placeholder="Título otimizado para SEO"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.meta_title.length}/60 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Meta Descrição</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      maxLength={160}
                      rows={3}
                      placeholder="Descrição otimizada para resultados de busca"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.meta_description.length}/160 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Palavras-chave</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="smartphone, iphone, apple, tecnologia"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="novo, promoção, destaque"
                      className={`w-full px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-lg border-2 border-gray-700 hover:bg-gray-800 transition-colors whitespace-nowrap font-bold cursor-pointer"
            >
              <i className="ri-close-line mr-2"></i>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-save-line text-xl"></i>
                  Salvar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}