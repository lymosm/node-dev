import db from "../db.server";
import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";
import { createMetafield, createDefinition, getDefinitions } from "../lib/metafield";
import { getOptionById } from "./api.option";

export const action = async ({request}) =>{
    console.log("edit in...");
    const { session, admin } = await authenticate.admin(request);
    const params = {
        ...Object.fromEntries(await request.formData())
    };
    params.option_id = Number(params.option_id);

    if(typeof params.action != "undefined" && params.action == "delete"){
        const status = await db.po_option_product.delete({
            where: {
                id: Number(params.id)
            }
        });
        // return redirect("/app/product_option_list");
        return Response.json({"success": true});
    }

    delete params.product_name;

    if(typeof params.id !== "undefined" && params.id != "" && params.id !== null){
        const where = {
            id: Number(params.id)
        };
        delete params.id;
        const status = await db.po_option_product.update({data: params, where: where});
    }else{
        delete params.id;
        const status = await db.po_option_product.create({data: params});

        
    }
    console.log("edit medium...");

    const key = "pp_product_options";
        const namespace = "pp_options";
        const type = "json";
        const ownerType = "PRODUCT";
        const access = {
          "storefront": "PUBLIC_READ"
        };
        const name = "ppProductOption";
        const old = await getDefinitions(admin, {"ownerType": ownerType, "key": key});
        console.log(old.data.metafieldDefinitions.edges);
        if(old.data.metafieldDefinitions.edges.length == 0){
          await createDefinition(admin, {"definition": {
            "key": key,
            "namespace": namespace,
            "type": type,
            "access": access,
            "ownerType": ownerType,
            "name": name
          }});
        }

        const option_data = await getOptionById(params.option_id);
        console.log(option_data);
        const option_data_val = JSON.stringify(option_data);

        const product_metafield = {
          "metafields": {
            "key": key,
            "namespace": namespace,
            "ownerId": params.product_id,
            "type": type,
            "value": option_data_val
          }
        };
        const meta = await createMetafield(admin, product_metafield);
        console.log(meta.data.metafieldsSet.metafields);
    
    return Response.json({"success": true});
    // return redirect("/app/product_option_list");
};

export const getProductOptionList = async () => {
    return await db.po_option_product.findMany();
}

export const getProductOptionById = async (id) => {
    const data = await db.po_option_product.findFirst({
        where: {
            id: Number(id)
        }
    });
    return data;
}