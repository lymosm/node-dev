import { useActionData, useLoaderData, Link } from "@remix-run/react";
import { Page, Card, DataTable, Banner, Button, IndexTable } from "@shopify/polaris";
import { getOptionList } from "./option_list";
// import React from "react";
import { useEffect, useState} from "react";
import { Alert } from "../component/alert";
import Test from "../component/test";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({request}) => {
	const list = await getOptionList();
	return list;
};

export default function Index () {

	const data = useActionData();
	const rows = useLoaderData();
	// console.log("rows", rows);

	/*
	const rows = [
		["1", "222", "333", "444"],
		["2", "222", "333", "444"]
	];
	*/

	const [show_alert, set_show_alert] = useState(false);
	const handleDelete = (id) => {
		set_show_alert(true);
	};
	
	/*
	useEffect(() => {
			const bridge = useAppBridge();
			bridge.modal.show("op-alert");
	});
	*/

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
				<Button>Delete</Button>
			</IndexTable.Cell>
		</IndexTable.Row>
	));
	return (
		<Page>
			<Banner>
				<Button url="/app/add_option/0">Add Option</Button>
				<Alert/>
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