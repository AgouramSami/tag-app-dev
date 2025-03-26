import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../styles/FAQ.css";

const FAQ = ({ isJuriste }) => {
  const [faqs, setFaqs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", reponse: "" });
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Permet d'accéder aux éléments HTML des questions
  const faqRefs = useRef({});
  const location = useLocation();

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    // Vérifie s'il y a un ancrage dans l'URL (ex: /faq#idQuestion)
    if (location.hash) {
      const faqId = location.hash.substring(1); // Supprime le '#'
      setTimeout(() => {
        if (faqRefs.current[faqId]) {
          faqRefs.current[faqId].scrollIntoView({ behavior: "smooth" });
          setExpandedIndex(faqs.findIndex((faq) => faq._id === faqId));
        }
      }, 500);
    }
  }, [faqs, location.hash]);

  const fetchFAQs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faqs");
      setFaqs(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des FAQ :", error);
    }
  };

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddFAQ = async () => {
    try {
      await axios.post("http://localhost:5000/api/faqs", newFaq, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      fetchFAQs();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la FAQ :", error);
    }
  };

  return (
    <div className="faq-container">
      <h1 className="faq-title">📖 Foire aux Questions</h1>

      {isJuriste && (
        <button className="add-faq-btn" onClick={() => setIsModalOpen(true)}>
          ➕ Ajouter une FAQ
        </button>
      )}

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={faq._id}
            id={faq._id} // Ajoute l'ID pour l'ancrage
            ref={(el) => (faqRefs.current[faq._id] = el)}
            className="faq-item"
          >
            <div className="faq-question" onClick={() => handleToggle(index)}>
              {faq.question} {expandedIndex === index ? "−" : "+"}
            </div>
            {expandedIndex === index && (
              <div className="faq-answer">{faq.reponse}</div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setIsModalOpen(false)}
            >
              ✖
            </button>
            <h2>Ajouter une FAQ</h2>
            <input
              type="text"
              placeholder="Question"
              value={newFaq.question}
              onChange={(e) =>
                setNewFaq({ ...newFaq, question: e.target.value })
              }
              className="faq-input"
            />
            <textarea
              placeholder="Réponse"
              value={newFaq.reponse}
              onChange={(e) =>
                setNewFaq({ ...newFaq, reponse: e.target.value })
              }
              className="faq-textarea"
            />
            <button className="save-faq-btn" onClick={handleAddFAQ}>
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQ;
