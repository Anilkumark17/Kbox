import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/db";
import './flashcard.css'

const FlashCard = () => {
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState(null);

  // Step 1: Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (user) setUserId(user.id);
    };

    fetchUser();
  }, []);

  // Step 2: Function to fetch random favorite cards
  const getRandomFavoriteCards = async (uid) => {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", uid)
      .eq("is_favorite", true);

    if (error) {
      console.error("Error fetching favorite cards:", error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Shuffle and return 3 random cards
    const shuffled = data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Step 3: Set interval to fetch new cards every 10 seconds
  useEffect(() => {
    let interval;

    const fetchCards = async () => {
      if (userId) {
        const randomCards = await getRandomFavoriteCards(userId);
        setCards(randomCards);
      }
    };

    if (userId) {
      fetchCards(); // Initial load
      interval = setInterval(fetchCards,  43200000); // Every 10s
    }

    return () => clearInterval(interval); // Cleanup
  }, [userId]);

  // Step 4: Render UI
  return (
    <div className="flashcard-container">
      <h2>Flashback: Favorite Cards</h2>
      {cards.length > 0 ? (
        <div className="card-list">
          {cards.map((card) => (
            <div key={card.id} className="card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {card.link && (
                <a href={card.link} target="_blank" rel="noopener noreferrer">
                  Visit
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No favorite cards found.</p>
      )}
    </div>
  );
};

export default FlashCard;
