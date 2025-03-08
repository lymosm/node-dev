import db from "../db.server";
import { authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";

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
    /*
    const response = await admin.graphql(
        `#graphql
          mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
              id
              namespace
              key
            }
            userErrors {
              field
              message
              code
            }
          }
        }`,
        {
          variables: 
          {
            "definition": {
              "name": "My read-only metafield definition",
              "namespace": "some-namespace22",
              "key": "some-key223",
              "type": "single_line_text_field",
              "ownerType": "PRODUCT",
              
            }
          }
        },
      );
      const data = await response.json();
      */
      
    
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