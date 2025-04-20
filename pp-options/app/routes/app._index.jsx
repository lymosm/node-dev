import { useLoaderData, Link, useSubmit, useNavigate } from "@remix-run/react";
import { Page, Card, Banner, Button, IndexTable } from "@shopify/polaris";
import { getOptionList } from "./api.option_list";
import { useState} from "react";
import { Alert, ShowAlert } from "../component/alert";
import React from "react";

React.useLayoutEffect = React.useEffect 

export const loader = async ({request}) => {
	const list = await getOptionList();
	return list;
};

export default function Index () {
	const navigate = useNavigate();
	const rows = useLoaderData();

	const [delete_id, set_delete_id] = useState(0);

	
	const handleDeleteShow = (id) => {
		ShowAlert();
		set_delete_id(id);
	};
	
	const formData = new FormData;
    formData.append("id", delete_id);
    formData.append("action", "delete");
	const submit = useSubmit();
/*
	const handleDelete = () => {
		console.log("del", delete_id);
		submit({action: "delete", id: delete_id}, {method: "POST", action: "/api/option"});
	};
	*/

	const handleDelete = async () => {

        // submit({action: "delete", id: delete_id}, {method: "POST", action: "/option_product"});
        console.log(formData);
        try {
            const response = await fetch("/api/option",  {
              method: "POST",
              body: formData, // 发送  数据
            });
            const result = await response.json();
            // setData(result);
            alert("success");
            navigate("/app");
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            // setLoading(false);
      
          }
    }

	
	const rowsMarkup = rows.map(({id, shop, option_name, price, added_time}, index) => (
		<IndexTable.Row
			key={id}
		>
			<IndexTable.Cell>{id}</IndexTable.Cell>
			<IndexTable.Cell>{option_name}</IndexTable.Cell>
			<IndexTable.Cell>{price}</IndexTable.Cell>
			<IndexTable.Cell>{shop}</IndexTable.Cell>
			<IndexTable.Cell>{added_time}</IndexTable.Cell>
			<IndexTable.Cell>
				<Link to={`add_option/${id}`}>Edit</Link>
				<Button onClick={() => handleDeleteShow(id)}>Delete</Button>
			</IndexTable.Cell>
		</IndexTable.Row>
	));
	
	return (
		<Page>
			<Banner>
				<Button url="/app/add_option/0">Add Option</Button>
				<Alert msg="Delete?" callback={handleDelete}/>
			</Banner>
			<Card>
				<IndexTable
				itemCount={rows.length}
				headings={[
					{title: "ID"},
					{title: "Option Name"},
					{title: "Price"},
					{title: "Shop"},
					{title: "Date"},
					{title: "Action"}
				]}
				>
					{rowsMarkup}
				</IndexTable>
			</Card>
			

		</Page>
	);
};