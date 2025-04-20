import { useState } from "react";
import { Card, TextContainer, Text } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export default function MetaObject(){
    const fetch = useAuthenticatedFetch();
    
  const handleGetMetaObject = async function (){
    alert("sdd");
    
    const responsed = await fetch('/api/metaobjcts', {method: "POST"});
    console.log(response);
  }
  return (
    <button id="btn" onClick={handleGetMetaObject} type="button">Click</button>
  );
}
