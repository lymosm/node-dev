/**
 * public qrcode page
 */
import {Page, Button} from "@shopify/polaris";
import {json} from "@remix-run/node";
import db from "../db.server";
import { getQrcodeImage } from "~/models/QRCode.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({params}) => {
    const id = Number(params.id);
    const qrcode = await db.qRCode.findFirst({where: {id}});
    return json({
        title: qrcode?.title,
        image: getQrcodeImage(id)
    });
}

export default function QRCode(){
    const {title, image} = useLoaderData();
    return (
        <>
            <h1>{title}</h1>
            <img src={image} alt={`qrcode for product`} />
        </>
    );
}