import db from "../db.server";
import { useState } from "react";
import { getProductOptionList } from "./api.option_product";
import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
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
    const navigate = useNavigate();
    const [delete_id, set_delete_id] = useState(0);
    const formData = new FormData;
    formData.append("id", delete_id);
    formData.append("action", "delete");
    const handleDeleteShow = (id) => {
        set_delete_id(id);
        

        ShowAlert();
    }
    const submit = useSubmit();

    const handleDelete = async () => {

        // submit({action: "delete", id: delete_id}, {method: "POST", action: "/option_product"});
        console.log(formData);
        try {
            const response = await fetch("/api/option_product",  {
              method: "POST",
              body: formData, // 发送  数据
            });
            const result = await response.json();
            // setData(result);
            alert("success");
            navigate("/app/product_option_list");
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            // setLoading(false);
      
          }
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