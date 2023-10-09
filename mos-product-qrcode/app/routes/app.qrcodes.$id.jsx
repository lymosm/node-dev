import {useState} from "react";
import { useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Page, Button, Text, Bleed, TextField, Card, Layout, EmptyState, PageActions, VerticalStack, 
    Divider,
    HorizontalStack, 
    ChoiceList} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getQrcode } from "../models/QRCode.server";

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

export default function QRCodeForm(){
    const navigate = useNavigate();
    const nav = useNavigation();
    const qrcode = useLoaderData();
    const [ formState, setFormState ] = useState(qrcode);

    const submit = useSubmit();

    function handleSave(){
        const data = {
            title:  formState.title
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
                                helpText="Only daff"
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
                                <HorizontalStack>
                                    <Text as="h2">
                                        {formState.productTitle}
                                    </Text>
                                
                                </HorizontalStack>
                                <VerticalStack>
                                    <Button>
                                        Select Product
                                    </Button>
                                
                                </VerticalStack>

                                <Bleed marginInline="20">
                                    <Divider/>
                                </Bleed>

                                <HorizontalStack gap="5">
                                    <ChoiceList
                                        title="Scan destination"
                                        selected={[formState.destination]}
                                        choices={[
                                            {
                                                label: "Link to product page",
                                                value: "product"
                                            },
                                            {
                                                label: "Link to checkout page with cart",
                                                value: "cart"
                                            }
                                        ]} />
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