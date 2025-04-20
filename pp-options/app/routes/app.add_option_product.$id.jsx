import { Select, Page, Card, Form, Button, Text, TextField, Layout } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
import { getOptionList } from "./api.option_list";
import { getProductOptionById } from "./api.option_product";
import { json } from "@remix-run/node";

export const loader = async ({request, params}) => {
    const options = await getOptionList();
    const id = params.id;
    var data = {};
    if(id == "" || id == null || id == "0"){
        data = {
            option_id: "0",
            product_id: ""
        };
    }else{
        data = await getProductOptionById(id);
    }
    return json({
        options: options,
        data: data
    });
};

export default function Index() {
    const navigate = useNavigate();

    const loader_data = useLoaderData();
    const options = loader_data.options;
    const data = loader_data.data;
    var arr = [
        {
            label: "Select Option",
            value: "0"
        }
    ];
    data.option_id = String(data.option_id);
    options.map(function(a, index){
        arr.push({label: a.option_name, value: String(a.id)});
    });
    // set_option_list(arr);
   // useCallback((arr) => set_option_list(arr));
 
    const [form, setFormState] = useState(data);
    // const [option_id, setSelected] = useState("0");

    const handleOptionChange = useCallback((option_id) => setFormState({...form, option_id}));
    // const handleOptionChange = useCallback((option_id) => setSelected(option_id));
   // const handleProductChange = useCallback((product_id) => setFormState({...form, product_id}), []);
    const submit = useSubmit();

    async function selectProduct(){
        const products = await window.shopify.resourcePicker({
            type: "product",
            action: "select"
        });
        if(products){
            const { images, id, variants, title, handle } = products[0];
            setFormState({
                ...form,
                product_id: id,
                product_name: title
            });
        }
    }


    const formData = new FormData;
    // formData.append("added_time", form.added_time);
    formData.append("option_id", form.option_id);
    formData.append("id", (typeof form.id == "undefined" || form.id == "undefined") ? "" : form.id);
    formData.append("product_id", (typeof form.product_id == "undefined" || form.product_id == "undefined") ? "" : form.product_id);
    formData.append("product_name", form.product_name);
    // formData.append("shop", form.shop);

    // const handleSubmit = () => submit(form, {method: "POST", action: "/api/option_product"});

    const handleSubmit = async () => {
        // setLoading(true);
        try {
          const response = await fetch("/api/option_product",  {
            method: "POST",
            /*
            headers: {
              "Content-Type": "application/x-www-form-urlencoded", // 设置请求头
            },
            */
            body: formData, // 发送  数据
          });
          const result = await response.json();
          // setData(result);
          console.log(result);
          alert("success");
          navigate("/app/product_option_list");
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          // setLoading(false);
    
        }
      };
    return (
        <Page>
            <Card>
                <Form onSubmit={handleSubmit}>
                    <Select
                    label="Option"
                    options={arr}
                    onChange={handleOptionChange}
                    value={form.option_id}
                    />

                    <input type="hidden" name="product_id" value={form.product_id}></input>
                    <TextField label="Your Select Product" value={form.product_name} readOnly></TextField>
                    <Button onClick={selectProduct}>
                        Select Product
                    </Button>
                    <Layout>
                        <Layout.Section>
                            <Button onClick={handleSubmit}>Save</Button>
                        </Layout.Section>
                        
                    </Layout>  
                    
                </Form>

            </Card>

        </Page>
    )
}