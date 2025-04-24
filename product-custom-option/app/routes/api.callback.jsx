import db from "../db.server";
import { authenticate } from "../shopify.server";
import { useNavigate } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { cartCreateCallback, cartUpdateCallback } from "../callback/webhookCallback";


export const action = async({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const data = {
        ...Object.fromEntries(await request.formData()),
        shop
    };
    console.log("data", data);

    switch(data.topic){
        case "CARTS_CREATE":
            return cartCreateCallback(data);
        break;
        case "CARTS_UPDATE":
            return cartUpdateCallback(data);
        break;
    }

    return Response.json({"success": true});
}
