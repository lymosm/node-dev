import {useState} from "react";
import { useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Page, Button, Text, TextField, Card, Layout, EmptyState, PageActions, VerticalStack, HorizontalStack } from "@shopify/polaris";
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
                    <VerticalStack>
                        <Card>
                            <VerticalStack>
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
                            <VerticalStack>
                                <HorizontalStack>

                                </HorizontalStack>
                            </VerticalStack>
                        </Card>
                    </VerticalStack>
                </Layout.Section>

                <Layout.Section>

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