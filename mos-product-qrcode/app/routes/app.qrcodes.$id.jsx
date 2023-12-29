import {useState} from "react";
import { useLoaderData, useNavigate, useNavigation, useSubmit, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { Page, Button, Text, Bleed, TextField, Card, Layout, EmptyState, PageActions, VerticalStack, 
    Divider,
    HorizontalStack, 
    Thumbnail,
    ChoiceList} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getQrcode } from "../models/QRCode.server";
import db from "../db.server";

export async function loader ({request, params}){

    const { admin } = await authenticate.admin(request); 

    if(params.id === "new"){
        return json({
            destination: "product",
            title: ""
        });
    }

    return json(await getQrcode(Number(params.id), admin.graphql));
}

export async function action( { request, params } ){
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const data = {
        ...Object.fromEntries(await request.formData()),
        shop
    };

    if(data.action === "delete"){
        await db.qRcode.delete({where: {id: Number(params.id)}});
        return redirect("/app");
    }
    console.log("kkkkkkkkkkkk");
    console.log(data);
    
    const qrcode = params.id === "new"? await db.qRCode.create({data}) : await db.qRCode.update({where: {id: Number(parmas.id)}, data});
    return redirect(`/app/qrcodes/${qrcode.id}`);
}

export default function QRCodeForm(){
    const errors = useActionData()?.errors || {};
    const navigate = useNavigate();
    const nav = useNavigation();
    const qrcode = useLoaderData();
    const [ formState, setFormState ] = useState(qrcode);


    async function selectProduct(){
        const products = await window.shopify.resourcePicker({
            type: "product",
            action: "select"
        });
        if(products){
            const { images, id, variants, title, handle } = products[0];
            setFormState({
                ...formState,
                productId: id,
                productVariantId: variants[0].id,
                productTitle: title,
                productHandle: handle,
                productAlt: images[0]?.altText,
                productImage: images[0]?.originalSrc,
            });
        }
    }

    const submit = useSubmit();

    function handleSave(){
        const data = {
            title:  formState.title,
            productId: formState.productId || "",
            productHandle: formState.productHandle || "",
            productVariantId: formState.productVariantId || "",
            destination: formState.destination
        };
        submit(data, {method: "post"});
    }

    const isSaving = nav.state === "submitting";
    const isDeleteing = nav.state === "submitting" && nav.formData?.get("action") === "delete";

    return (
        <Page>
            <ui-title-bar title={qrcode.id ? "Edit" : "Create"}>
                <button onClick={ () => navigate("/app")}>List</button>
            </ui-title-bar>
            <Layout>
                <Layout.Section>
                    <VerticalStack gap="5">
                        <Card>
                            <VerticalStack gap="5"> 
                                <Text as="h2">
                                    Title
                                </Text>
                                <TextField 
                                id="title" 
                                label="title"
                                labelHidden
                                autoComplete="off"
                                helpText="Only daff bbb"
                                value={formState.title}
                                onChange={(title) => setFormState({ ...formState, title })}
                                error={errors.title}
                                />
                                
                            </VerticalStack>
                        </Card>
                        
                        <Card>
                            <VerticalStack gap="5">
                                <HorizontalStack>
                                    <Text as="h2">
                                        Product
                                    </Text>
                                
                                </HorizontalStack>

                                {formState.productId ? (
                                    <HorizontalStack>
                                        <Thumbnail
                                            source={formState.productImage}
                                            alt={formState.productAlt}
                                        />
                                        <Text as="span">
                                            {formState.productTitle}
                                        </Text>
                                    
                                    </HorizontalStack>) : (
                                    <VerticalStack>
                                        <Button onClick={selectProduct}>
                                            Select Product
                                        </Button>
                                    
                                    </VerticalStack> )}

                                <Bleed marginInline="20">
                                    <Divider/>
                                </Bleed>

                                <HorizontalStack gap="5">
                                    <ChoiceList
                                        title="Scan destination"
                                        selected={[formState.destination]}
                                        choices={[
                                            {
                                                label: "Link to product pagexxx",
                                                value: "product"
                                            },
                                            {
                                                label: "Link to checkout page with cart",
                                                value: "cart"
                                            }
                                        ]}
                                        onChange={(destination) => setFormState({...formState, destination: destination[0]})}
                                        error={errors.destination}
                                        />
                                </HorizontalStack>
                            </VerticalStack>
                        </Card>
                    </VerticalStack>
                </Layout.Section>

                <Layout.Section secondary>
                    <Card>
                        <Text as="h2">
                            QRCode
                        </Text>
                        {qrcode ? (
                            <EmptyState image="">

                            </EmptyState>
                        ) : (
                            <EmptyState image="">
                                Your QrCode will be shown here after you save
                            </EmptyState>
                        )}

                        <VerticalStack gap="3">
                            <Button
                            primary
                            >
                                Download
                            </Button>
                            <Button
                            external
                            >
                                Go To Public Url
                            </Button>
                        </VerticalStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <PageActions secondaryActions={[
                        {
                            content: "delete",
                            loading: isDeleteing,
                            disabled: isDeleteing,
                            onAction: () =>
                                submit({ action: "delete" }, { method: "post" })

                        }
                    ]}
                    primaryAction={{
                        content: "Save",
                        loading: isSaving,
                        disabled: isSaving || isDeleteing,
                        onAction: handleSave
                    }} />
                </Layout.Section>
            </Layout>
        </Page>
    );
}