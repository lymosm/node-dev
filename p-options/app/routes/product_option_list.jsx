import db from "../db.server";
import React from "react";

export const action = ({request}) => {
    const list = db.po_option_product.findMany();

    return list;
};