import React, { useState } from "react";
import CardContainer from "../../containers/card/CardContainer";
import { supabase } from "../../utils/db";
import { useParams } from "react-router-dom";

const Card = () => {
  const { id } = useParams();
  const [create, setCreate] = useState([]);
  const [cat, setCat] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  const createSubmit = async (e) => {
    e.preventDefault();

     const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) return console.error("Error fetching user:", userError);
    
        const userId = userData?.user?.id;
        if (!userId) return console.warn("User ID not found");
        

    const { data, error } = await supabase.from("cards").insert([
      {
        title: cat,
        user_id:userId,
        category_id: id,
        link: link,
        description: description,
      },
    ]);

    if (error) throw error;
    console.log(data);
    setCreate(data);

    window.location.reload();
  };



  return (
    <CardContainer
      cat={cat}
      onCat={(e) => setCat(e.target.value)}
      link={link}
      onLink={(e) => setLink(e.target.value)}
      description={description}
      onDes={(e) => setDescription(e.target.value)}
      onSubmit={createSubmit}
      create={create}
      id={id}
    />
  );
};

export default Card;
