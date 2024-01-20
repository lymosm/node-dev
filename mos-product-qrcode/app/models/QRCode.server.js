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
    return Promise.all( qrcodes.map((qrcode) => supplementQRCode(qrcode, graphal)));
}

export async function getQrcode(id, graphal){
    const qrCode = await db.qRCode.findFirst({
        where: {id}
    });
    if(! qrCode){
        return null;
    }
    return supplementQRCode(qrCode, graphal);
}

async function supplementQRCode(qrCode, graphal){
    const qrCodeImagePromise = getQrcodeImage(qrCode.id);
    const response = await graphal(
        `
      query supplementQRCode($id: ID!) {
        product(id: $id) {
          title
          images(first: 1) {
            nodes {
              altText
              url
            }
          }
        }
      }
    `,
        {
            variables: {
                id: qrCode.productId
            }
        }
    );
    const { data: { product } } = await response.json();
    return {
        ...qrCode,
        productDeleted: ! product ?. title,
        productTitle: product ?. title,
        productImage: product ?. images ?. nodes[0] ?. url,
        productAlt: product ?. images ?. nodes[0] ?. altText,
        destinationUrl: getDestinationUrl(qrCode),
        image: await qrCodeImagePromise,
    };
}

export function getDestinationUrl(qrCode){
    if(qrCode.destinationUrl === "product"){
        return `https://${qrCode.shop}/product/${qrCode.productHandle}`;
    }
    return "";
}