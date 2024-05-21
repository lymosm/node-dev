import { Select, Page, Card, Form, Button, Text, TextField, Layout } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { getOptionList } from "./option_list";

export const loader = ({request, params}) => {
    const options = getOptionList();
    return options;
};

export default function Index() {

    const optionss = useLoaderData();
    var arr = [
        {
            label: "Select Option",
            value: "0"
        }
    ];
    optionss.map(function(a, index){
        arr.push({label: a.option_name, value: String(a.id)});
    });
    // set_option_list(arr);
   // useCallback((arr) => set_option_list(arr));
 
    
    const data = {
        option_id: "0",
        product_id: "",
        product_name: ""
    };
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


    const handleSubmit = () => submit(form, {method: "POST", action: "/option_product"});
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
                            <Button submit>Save</Button>
                        </Layout.Section>
                        
                    </Layout>  
                    
                </Form>

            </Card>

        </Page>
    )
}