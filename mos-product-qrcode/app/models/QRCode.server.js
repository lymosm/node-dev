import qrcode from "qrcode";
import invariant from "tiny-invariant";
import db from "../db.server";

export function getQrcodeImage(id){
    const url = new URL(`/qrcode/${id}/scan`, process.env.SHOPIFY_APP_URL);
    return qrcode.toDataURL(url.href);
}

export async function getQRcodes(shop, graphal){
    const qrcodes = await db.qRCode.findMany({
        where: { shop },
        orderBy: { id: "desc" }
    });
    return [];
}
