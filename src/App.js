import React, { useState, useEffect } from "react";

// --- IMPORTANDO O FIREBASE ---
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// --- SUAS CHAVES DE ACESSO (JÁ INTEGRADAS) ---
const firebaseConfig = {
  apiKey: "AIzaSyB7phsUmJGWD1GhsiyavIHKKaf6_5N5UO4",
  authDomain: "alfa-partners.firebaseapp.com",
  projectId: "alfa-partners",
  storageBucket: "alfa-partners.firebasestorage.app",
  messagingSenderId: "279437224054",
  appId: "1:279437224054:web:dc24700c5c0fb397dd1757",
};

// --- INICIALIZANDO O BANCO DE DADOS ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const partnersCollectionRef = collection(db, "partners");

// --- ÍCONES SVG ---
const PhoneIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "6px", opacity: 0.7 }}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const WhatsappIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ marginRight: "6px", opacity: 0.7 }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function AlfaFormalApp() {
  const [partners, setPartners] = useState([]); // Começa vazio, pois busca do Firebase
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados locais do Modal
  const [paymentType, setPaymentType] = useState("Faturado");
  const [paymentDays, setPaymentDays] = useState("30");

  // --- BUSCAR DADOS DO FIREBASE (Ao carregar a página) ---
  useEffect(() => {
    const getPartners = async () => {
      try {
        const data = await getDocs(partnersCollectionRef);
        setPartners(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert(
          "Erro de conexão. Verifique se o 'Firestore Database' foi criado no console do Firebase."
        );
        setIsLoading(false);
      }
    };

    getPartners();
  }, []);

  // --- CÁLCULOS KPI ---
  const totalPartners = partners.length;
  const citiesCount = [...new Set(partners.map((p) => p.city))].length;
  const totalCost = partners.reduce(
    (acc, curr) => acc + curr.servicePrice + (curr.tanatoPrice || 0),
    0
  );
  const avgTicket = totalPartners > 0 ? totalCost / totalPartners : 0;

  const filteredPartners = partners.filter(
    (p) =>
      (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- FUNÇÕES ---
  const handleOpenModal = (partner = null) => {
    setCurrentPartner(partner);
    if (partner) {
      if (partner.paymentMethod && partner.paymentMethod.includes("Faturado")) {
        setPaymentType("Faturado");
        const days = partner.paymentMethod.replace(/\D/g, "") || "30";
        setPaymentDays(days);
      } else {
        setPaymentType(partner.paymentMethod || "A combinar");
        setPaymentDays("30");
      }
    } else {
      setPaymentType("Faturado");
      setPaymentDays("30");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentPartner(null);
    setIsModalOpen(false);
  };

  // --- SALVAR NO FIREBASE ---
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    let finalPaymentString = paymentType;
    if (paymentType === "Faturado") {
      finalPaymentString = `Faturado ${paymentDays} dias`;
    }

    const partnerData = {
      name: formData.get("name"),
      city: formData.get("city"),
      state: formData.get("state"),
      phone: formData.get("phone"),
      whatsapp: formData.get("whatsapp"),
      servicePrice: parseFloat(formData.get("servicePrice")) || 0,
      tanatoPrice: parseFloat(formData.get("tanatoPrice")) || 0,
      paymentMethod: finalPaymentString,
      observations: formData.get("observations"),
    };

    try {
      if (currentPartner) {
        // ATUALIZAR
        const partnerDoc = doc(db, "partners", currentPartner.id);
        await updateDoc(partnerDoc, partnerData);
        // Atualiza localmente
        setPartners(
          partners.map((p) =>
            p.id === currentPartner.id
              ? { ...partnerData, id: currentPartner.id }
              : p
          )
        );
      } else {
        // CRIAR NOVO
        const docRef = await addDoc(partnersCollectionRef, partnerData);
        setPartners([...partners, { ...partnerData, id: docRef.id }]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar no banco de dados.");
    }
  };

  // --- DELETAR NO FIREBASE ---
  const handleDelete = async (id) => {
    if (window.confirm("Confirmar exclusão do registro?")) {
      try {
        const partnerDoc = doc(db, "partners", id);
        await deleteDoc(partnerDoc);
        setPartners(partners.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar o registro.");
      }
    }
  };

  return (
    <div className="formal-app">
      {/* --- ESTILOS CSS --- */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; color: #212529; -webkit-font-smoothing: antialiased; }
        .formal-app { min-height: 100vh; padding: 40px; max-width: 1200px; margin: 0 auto; }
        :root { --primary-dark: #343a40; --gray-text: #6c757d; --border-color: #dee2e6; --bg-card: #ffffff; --bg-hover: #e9ecef; }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid var(--border-color); }
        .logo { font-size: 1.75rem; font-weight: 800; color: #212529; letter-spacing: -0.5px; text-transform: uppercase; }
        .btn-formal { background: var(--primary-dark); color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; text-transform: uppercase; }
        .btn-formal:hover { background: #212529; }
        
        .kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .kpi-card { background: var(--bg-card); border-radius: 8px; padding: 25px; border: 1px solid var(--border-color); display: flex; flex-direction: column; }
        .kpi-label { color: var(--gray-text); font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; }
        .kpi-value { font-size: 2.5rem; font-weight: 700; color: #212529; }
        
        .search-container { position: relative; margin-bottom: 30px; }
        .search-input { width: 100%; padding: 16px 20px 16px 50px; background: white; border: 2px solid var(--border-color); border-radius: 8px; color: #212529; font-size: 1rem; outline: none; transition: 0.2s; }
        .search-input:focus { border-color: var(--primary-dark); }
        .search-icon { position: absolute; left: 20px; top: 18px; color: var(--gray-text); font-size: 1.1rem; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; align-items: stretch; }
        .card { background: var(--bg-card); border-radius: 12px; padding: 25px; position: relative; transition: all 0.2s ease; border: 1px solid var(--border-color); display: flex; flex-direction: column; height: 100%; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #adb5bd; }
        
        .card-header { margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; min-height: 85px; display: flex; flex-direction: column; justify-content: flex-start; }
        .city-badge { background: var(--bg-hover); color: var(--primary-dark); padding: 6px 12px; border-radius: 4px; font-size: 0.95rem; font-weight: 800; text-transform: uppercase; display: inline-block; margin-bottom: 10px; width: fit-content; }
        .card h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #212529; line-height: 1.2;}
        
        .contact-info { margin-bottom: 15px; height: 50px; display: flex; flex-direction: column; justify-content: flex-start; }
        .contact-row { color: var(--gray-text); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; margin-bottom: 6px; }
        
        .price-block { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid var(--border-color); }
        .price-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--gray-text); margin-bottom: 8px; }
        .price-total { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 10px; color: #212529; }
        .total-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; } 
        .total-value { font-size: 1.1rem; font-weight: 700; white-space: nowrap; }
        
        .payment-section { margin-top: auto; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px; min-height: 40px; display: flex; align-items: center; }
        .obs-section { min-height: 50px; display: flex; flex-direction: column; }
        .meta-info { font-size: 0.9rem; color: var(--primary-dark); font-weight: 700; display: flex; align-items: center; gap: 8px;}
        .obs { background: #e9ecef; color: #495057; border: 1px solid #ced4da; padding: 10px; border-radius: 6px; display: block; font-size: 0.85rem; font-style: italic; flex-grow: 1; }
        .obs-placeholder { flex-grow: 1; min-height: 40px; }
        
        .card-actions { position: absolute; top: 20px; right: 20px; opacity: 0; transition: 0.2s; display: flex; gap: 5px; }
        .card:hover .card-actions { opacity: 1; }
        .act-btn { background: var(--bg-hover); border: 1px solid var(--border-color); color: var(--gray-text); width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: 0.2s; }
        .act-btn:hover { background: var(--primary-dark); color: white; border-color: var(--primary-dark); }
        .act-btn.del:hover { background: #dc3545; border-color: #dc3545; color: white; } 
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px;}
        .modal-content { background: white; padding: 35px; border-radius: 12px; width: 550px; max-width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto; }
        .form-label { display: block; margin-bottom: 8px; color: var(--primary-dark); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
        .form-input { width: 100%; background: white; border: 2px solid var(--border-color); color: #212529; padding: 12px; border-radius: 6px; margin-bottom: 20px; outline: none; font-size: 0.95rem; transition: 0.2s; }
        .form-input:focus { border-color: var(--primary-dark); }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 20px;}
        .btn-cancel { background: transparent; border: 2px solid var(--border-color); color: var(--gray-text); padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: 0.2s; }
        .btn-cancel:hover { background: var(--bg-hover); color: var(--primary-dark); }
      `}</style>

      {/* HEADER */}
      <header className="header">
        <div className="logo">ALFA PARCEIROS</div>
        <button className="btn-formal" onClick={() => handleOpenModal()}>
          <span>+</span> Nova Parceria
        </button>
      </header>

      {/* LOADING */}
      {isLoading && (
        <p style={{ textAlign: "center", color: "#666" }}>
          Carregando base de dados da Nuvem...
        </p>
      )}

      {/* KPIS */}
      {!isLoading && (
        <section className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Total de Parceiros</span>
            <span className="kpi-value">{totalPartners}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Cidades Cobertas</span>
            <span className="kpi-value">{citiesCount}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Ticket Médio (Est.)</span>
            <span className="kpi-value">R$ {avgTicket.toFixed(0)}</span>
          </div>
        </section>
      )}

      {/* BUSCA */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Pesquisar base de credenciados..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTA DE CARDS */}
      <main className="grid">
        {filteredPartners.map((partner) => (
          <div key={partner.id} className="card">
            <div className="card-actions">
              <button
                className="act-btn"
                onClick={() => handleOpenModal(partner)}
              >
                ✎
              </button>
              <button
                className="act-btn del"
                onClick={() => handleDelete(partner.id)}
              >
                ✕
              </button>
            </div>
            <div className="card-header">
              <span className="city-badge">
                {partner.city} / {partner.state}
              </span>
              <h3>{partner.name}</h3>
            </div>
            <div className="contact-info">
              {partner.phone && (
                <div className="contact-row">
                  <PhoneIcon /> {partner.phone}
                </div>
              )}
              {partner.whatsapp && (
                <div className="contact-row">
                  <WhatsappIcon /> {partner.whatsapp}
                </div>
              )}
            </div>
            <div className="price-block">
              <div className="price-row">
                <span>Serviço Funerário</span>{" "}
                <span
                  className="total-value"
                  style={{ fontSize: "0.9rem", fontWeight: "normal" }}
                >
                  R$ {partner.servicePrice.toFixed(2)}
                </span>
              </div>
              <div className="price-row">
                <span>Tanatopraxia</span>{" "}
                <span
                  className="total-value"
                  style={{ fontSize: "0.9rem", fontWeight: "normal" }}
                >
                  R$ {partner.tanatoPrice.toFixed(2)}
                </span>
              </div>
              <div className="price-total">
                <span className="total-label">Total Estimado</span>{" "}
                <span className="total-value">
                  R$ {(partner.servicePrice + partner.tanatoPrice).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="payment-section">
              <div className="meta-info">💳 {partner.paymentMethod}</div>
            </div>
            <div className="obs-section">
              {partner.observations ? (
                <span className="obs">⚠️ {partner.observations}</span>
              ) : (
                <div className="obs-placeholder"></div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2
              style={{
                marginTop: 0,
                marginBottom: "25px",
                fontSize: "1.3rem",
                fontWeight: 700,
                textTransform: "uppercase",
                borderBottom: "1px solid #dee2e6",
                paddingBottom: "15px",
              }}
            >
              {currentPartner ? "Editar Registro" : "Nova Parceria"}
            </h2>
            <form onSubmit={handleSave}>
              <div>
                <label className="form-label">Nome da Funerária</label>
                <input
                  name="name"
                  className="form-input"
                  defaultValue={currentPartner?.name}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Cidade</label>
                  <input
                    name="city"
                    className="form-input"
                    defaultValue={currentPartner?.city}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">UF</label>
                  <input
                    name="state"
                    className="form-input"
                    defaultValue={currentPartner?.state || "SP"}
                    maxLength="2"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Telefone (Fixo)</label>
                  <input
                    name="phone"
                    className="form-input"
                    defaultValue={currentPartner?.phone}
                    placeholder="(XX) XXXX-XXXX"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Whatsapp</label>
                  <input
                    name="whatsapp"
                    className="form-input"
                    defaultValue={currentPartner?.whatsapp}
                    placeholder="(XX) 9XXXX-XXXX"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">R$ Serviço Funerário</label>
                  <input
                    name="servicePrice"
                    type="number"
                    step="0.01"
                    className="form-input"
                    defaultValue={currentPartner?.servicePrice}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">
                    R$ Tanatopraxia (Opcional)
                  </label>
                  <input
                    name="tanatoPrice"
                    type="number"
                    step="0.01"
                    className="form-input"
                    defaultValue={currentPartner?.tanatoPrice}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  marginBottom: "20px",
                }}
              >
                <label className="form-label" style={{ marginBottom: "10px" }}>
                  Configuração de Pagamento
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="form-input"
                  style={{ marginBottom: "10px" }}
                >
                  <option value="Faturado">
                    Faturado (Boleto/Transferência)
                  </option>
                  <option value="PIX à vista">PIX à vista</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="A combinar">A combinar</option>
                </select>
                {paymentType === "Faturado" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#343a40",
                        fontSize: "0.9rem",
                      }}
                    >
                      Vencimento em:
                    </span>
                    <input
                      name="paymentDays"
                      type="number"
                      className="form-input"
                      style={{
                        width: "80px",
                        margin: 0,
                        textAlign: "center",
                        padding: "8px",
                      }}
                      value={paymentDays}
                      onChange={(e) => setPaymentDays(e.target.value)}
                      required
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#343a40",
                        fontSize: "0.9rem",
                      }}
                    >
                      dias.
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Observações</label>
                <textarea
                  name="observations"
                  rows="3"
                  className="form-input"
                  defaultValue={currentPartner?.observations}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="btn-formal"
                  style={{ boxShadow: "none" }}
                >
                  SALVAR REGISTRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
