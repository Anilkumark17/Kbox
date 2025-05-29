import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/db";
import "./flashcard.css";

const FlashCard = () => {
  const [flashCards, setFlashCards] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }
      const userId = userData?.user?.id;
      if (!userId) {
        console.warn("User ID not found");
        return;
      }

      const { data: responseData, error } = await supabase
        .from("favorite_flashcards")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching flashcards:", error);
        return;
      }

      setFlashCards(responseData || []);
    }

    fetchData();
  }, []);

  return (
    <div className="flashcard-container">
      {flashCards.map(({ title, link, description }, idx) => (
        <div className="flashcard" key={idx}>
          <h2 className="flashcard-title">{title}</h2>
          <a href={link} target="_blank" rel="noopener noreferrer" className="flashcard-link">
            {link}
          </a>
          <p className="flashcard-description">{description}</p>
        </div>
      ))}
    </div>
  );
};

export default FlashCard;
