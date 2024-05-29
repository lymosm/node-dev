import db from "../db.server";
import { useState } from "react";
import { getProductOptionList } from "./option_product";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Banner, Page, Card, IndexTable, Button } from "@shopify/polaris";
import { Link } from "@remix-run/react";
import { Alert, ShowAlert } from "../component/alert";

export const action = ({request}) => {
    const list = db.po_option_product.findMany();

    return list;
};

export const loader = async({request, params}) => {
    return await getProductOptionList();
}

export default function Index(){
    const list = useLoaderData();

    const [delete_id, set_delete_id] = useState(0);

    const handleDeleteShow = (id) => {
        set_delete_id(id);
        ShowAlert();
    }
    const submit = useSubmit();

    const handleDelete = () => {

        submit({action: "delete", id: delete_id}, {method: "POST", action: "/option_product"});
    }

    const rowMakeup = list.map(({id, option_id, product_id}, index) => (
        <IndexTable.Row key={id}>
            <IndexTable.Cell>{id}</IndexTable.Cell>
            <IndexTable.Cell>{option_id}</IndexTable.Cell>
            <IndexTable.Cell>{product_id}</IndexTable.Cell>
            <IndexTable.Cell>
				<Link to={`/app/add_option_product/${id}`}>Edit</Link>
				<Button onClick={() => handleDeleteShow(id)}>Delete</Button>
			</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Page>
            <Banner>
                <Button url="/app/add_option_product/0">Add Product Option</Button>
                <Alert msg="Delete?" callback={handleDelete} />
            </Banner>
            <Card>
                <IndexTable
                    itemCount={list.length}
                    headings={[
                        {title: "ID"},
                        {title: "option_id"},
                        {title: "product_id"},
                        {title: "action"}
                    ]}
                >
                    {rowMakeup}
                </IndexTable>
            </Card>
        </Page>
    );
}