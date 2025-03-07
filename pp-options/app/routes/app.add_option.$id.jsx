import {
    Box,
    Card,
    Layout,
    Link,
    Form,
    Page,
    TextField,
    BlockStack,
	Button,
  } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useSubmit, useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { getOptionById } from "./api.option";

export async function loader({request, params}){
  const { admin } = authenticate.admin(request);
  console.log("params", params);
  const id = params.id;

  if(id === "" || id === null || id == 0){
    return json({
      option_name: "",
      price: ""
    });
  }
  const data = getOptionById(id);
  return data;
};

export const action = async({request, params}) => {
  const form = {
    ...Object.fromEntries(await request.formData())
  };
  console.log("fff", form);
}

  
export default function addOptionPage() {
	
  const data = useLoaderData();

  /*
  // 单独设置
  const [option_name, set_option_name] = useState("");
  const [price, set_price] = useState("");

	const handleOptionNameChange = useCallback((value) => set_option_name(value), []);
  const handlePriceChange = useCallback((value) => set_price(value), []);

	const form = {
		option_name: option_name,
    price: price
	};
  */
 const [form, setFormState] = useState(data); 
 console.log("form", form);
 const navigate = useNavigate();
 const handleOptionNameChange = useCallback((option_name) => setFormState({...form, option_name}));
 const handlePriceChange = useCallback((price) => setFormState({...form, price}));

	const submit = useSubmit();

	// const handleSubmit = () => submit(form, {method: "POST", action: "/api/option"});
  const formData = new FormData;
  formData.append("added_time", form.added_time);
  formData.append("option_name", form.option_name);
  const id = 
  formData.append("id", (typeof form.id == "undefined" || form.id == "undefined") ? "" : form.id);
  formData.append("price", form.price);
  formData.append("shop", form.shop);

  

  const handleSubmit = async () => {
    // setLoading(true);
    try {
      const response = await fetch("/api/option",  {
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
      navigate("/app");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // setLoading(false);

    }
  };

    return (
      <Page>
        <ui-title-bar title="Add option" />
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Form onSubmit={handleSubmit}>
                  <TextField onChange={handleOptionNameChange} value={form.option_name} label="Option Name">

                  </TextField>
                  <TextField onChange={handlePriceChange} value={form.price} label="Price"></TextField>
                  <Button onClick={handleSubmit}>Save</Button>
                </Form>
                
              </BlockStack>
            </Card>
          </Layout.Section>
         
        </Layout>
      </Page>
    );
  }
  
  function Code({ children }) {
    return (
      <Box
        as="span"
        padding="025"
        paddingInlineStart="100"
        paddingInlineEnd="100"
        background="bg-surface-active"
        borderWidth="025"
        borderColor="border"
        borderRadius="100"
      >
        <code>{children}</code>
      </Box>
    );
  }
  