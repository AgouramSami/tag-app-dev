import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/FAQArticle.css";

const FAQArticle = () => {
  const { id } = useParams();
  const [faq, setFaq] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const response = await fetch(`${API_URL}/api/faqs/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de l'article");
        }

        const data = await response.json();
        setFaq(data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Une erreur est survenue lors du chargement de l'article"
        );
      }
    };

    fetchFAQ();
  }, [id]);

  if (!faq) return <p>Chargement...</p>;

  return (
    <div className="faq-article-container">
      <h1 className="faq-article-title">{faq.question}</h1>
      <p className="faq-article-content">{faq.reponse}</p>

      {faq.pieceJointe && (
        <div className="faq-pj-container">
          <h3>📎 Pièce jointe :</h3>
          <a
            className="faq-pj-link"
            href={`http://localhost:5000/${faq.pieceJointe}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger le fichier
          </a>
        </div>
      )}
    </div>
  );
};

export default FAQArticle;
