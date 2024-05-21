import db from "../db.server";

export const getOptionList = () => {
    const option = {
        orderBy: {
            id: "desc"
        }
    };
    const list = db.po_option.findMany(option);
    return list;
};