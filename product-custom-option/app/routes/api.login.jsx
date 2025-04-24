import db from "../db.server";
import { authenticate } from "../shopify.server";
import { useNavigate } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { Multipass } from "@tommy-935/shopify-multipass";


export const action = async({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const data = {
        ...Object.fromEntries(await request.formData()),
        shop
    };
    const multipass = new Multipass("2d81512b10839fd12ab59b46c559a946", "https://esr-ca-test.myshopify.com/");
    const url = multipass.generateLoginUrl({ email: "aaaa@esr.com" });
    console.log("data", data);
    
    return Response.json({"success": true, "url": url});
}

