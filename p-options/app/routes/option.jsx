import db from "../db.server";
import { authenticate } from "../shopify.server";
import { useNavigate } from "@remix-run/react";
import { redirect } from "@remix-run/node";

export const action = async({ request }) => {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    const data = {
        ...Object.fromEntries(await request.formData()),
        shop
    };
    console.log("data", data);
    delete data.added_time;

    if(typeof data.id !== "undefined" && data.id != "" && data.id !== null){
        const where = {
            id: Number(data.id),
            shop: data.shop
        };
        delete data.id;
        delete data.shop;
        const status = await db.po_option.update({data: data, where: where});
    }else{
        const status = await db.po_option.create({data});
    }
    
    // const navigate = useNavigate();
    // navigate("-1");
    return redirect("/app");
    // return new Response('success', {status: 200});
}

export const getOptionById = async (id) => {
    const data = await db.po_option.findFirst({
        where: {
            id: Number(id)
        }
    });
    return data;
}