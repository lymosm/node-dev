/**
 * scan action
 */
import { useLoaderData } from "@remix-run/react";
import { getDestinationUrl } from "../models/QRCode.server";
import db from "../db.server";
import { redirect } from "@remix-run/node";

export const loader = async ({params}) => {

    const id = Number(params.id);
    const qrcode = await db.qRcode.findFirst({where: {id}});

    // update scan count
    await db.qRCode.update({
        where: {id},
        data: {scans: {increment: 1}}
    });

    const public_qrcode_url = getDestinationUrl(qrcode);
    redirect(public_qrcode_url);
}