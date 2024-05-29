import { objectEnumNames } from "@prisma/client/runtime/library";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";

export const action = async ({request}) =>{
    const { session } = await authenticate.admin(request);
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
        return redirect("/app/product_option_list");
    }

    delete params.product_name;

    if(typeof params.id !== "undefined" && params.id != "" && params.id !== null){
        const where = {
            id: Number(params.id)
        };
        delete params.id;
        const status = await db.po_option_product.update({data: params, where: where});
    }else{
        const status = await db.po_option_product.create({data: params});
    }
    

    return redirect("/app/product_option_list");
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