import { Page, IndexTable, Layout, Card, EmptyState, Thumbnail, Icon, Text, LegacyStack, Link } from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useNavigate, useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";
import { getQRcodes } from "../models/QRCode.server";
import { ImageMajor, DiamondAlertMajor } from "@shopify/polaris-icons";

export const loader = async ({request}) => {
    const { admin, session } = await authenticate.admin(request);
    const qrcodes = await getQRcodes(session.shop, admin.graphql);
    return json({ qrcodes });
}

function truncate(str, {length = 25} = {}){
    if(! str){
        return "";
    }
    if(str.length <= length){
        return str;
    }
    return str.slice(0, length) + "...";
}

const EmptyQRState = ({onAction}) => (
    <EmptyState
        heading="Create unique qrcode for your product"
        action={{
            content: "Create QRCode",
            onAction
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
            <p>Allow customers scan qrcode and buy product use phones.</p>
        </EmptyState>
);

const QRTable = ({qrcodes}) => (
    <IndexTable
        itemCount={qrcodes.length}
        headings={[
            { title: "Thumbnail"},
            { title: "Title" },
            { title: "Product" },
            { title: "Date Created" },
            { title: "Scans" }
        ]
        }
    >
        {qrcodes.map((qrcode) => (
            <QRTableRow key={qrcode.id} qrcode={qrcode} />
        ))}

    </IndexTable>
);

const QRTableRow = ({qrcode}) => (
    <IndexTable.Row id={qrcode.id} position={qrcode.id}>
        <IndexTable.Cell>
            <Thumbnail
                source={qrcode.productImage || ImageMajor}
                alt={qrcode.productTitle}
                size="small"
            />
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Link url={`qrcodes/${qrcode.id}`}>{qrcode.title}</Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            {qrcode.productDeleted ? (
                <LegacyStack>
                    <span>
                        <Icon source="DiamondAlertMajor"/>
                    </span>
                    <Text as="span">
                        product has benn deleted
                    </Text>
                </LegacyStack>
            ) : (
                truncate(qrcode.productTitle)
            )}
        </IndexTable.Cell>
        <IndexTable.Cell>
            {new Date(qrcode.createdAt).toDateString()}
        </IndexTable.Cell>
        <IndexTable.Cell>
            {qrcode.scans}
        </IndexTable.Cell>
    </IndexTable.Row>
);

export default function Index(){
    const { qrcodes } = useLoaderData();
    const navigate = useNavigate();
    
    return (
        <Page>
            <ui-title-bar title="QRCode List">
                <button variant="primary" onClick = {() => navigate("/app/qrcodes/new")}>Create QR Code</button>
            </ui-title-bar>
            <Layout>
                <Layout.Section>
                    <Card>
                        {qrcodes.length === 0 ? (<EmptyQRState onAction={() => navigate("qrcodes/new")}></EmptyQRState>) : (<QRTable qrcodes={qrcodes}></QRTable>)}
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}