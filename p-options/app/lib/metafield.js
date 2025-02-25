/**
 * 
 * @param {*} admin 
 * @param {*} variables
 *  {
            "definition": {
              "name": "My read-only metafield definition",
              "namespace": "some-namespace22",
              "key": "some-key223",
              "type": "single_line_text_field",
              "ownerType": "PRODUCT",
              
            }
          }
 */
export const createDefinition = async (admin, variables) => {
    const response = await admin.graphql(
        `#graphql
          mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
              id
              namespace
              key
            }
            userErrors {
              field
              message
              code
            }
          }
        }`,
        {
          variables: variables
          
        },
      );
    const data = await response.json();
    return data;
};

/**
 * 
 * @param {*} admin 
 * @param {*} variables 
 * {
 *  ownerType: "PRODUCT",
 *  query: "namespace:nnnn AND key:mykey"
 * }
 * @returns 
 */
export const getDefinitions = async (admin, variables) => {
    const response = await admin.graphql(
        `query { metafieldDefinitions(first: 250, ownerType: $ownerType, query: $query) { edges { node { name } } } }`,
        {
          variables: variables
          
        },
      );
    const data = await response.json();
    return data;
};

/**
 * 
 * @param {*} admin 
 * @param {*} variables 
 * {
      "metafields": [
        {
          "key": "example_key",
          "namespace": "example_namespace",
          "ownerId": "gid://shopify/Product/20995642",
          "type": "single_line_text_field",
          "value": "Example Value"
        }
      ]
    }
 * @returns 
 */
export const createMetafield = async (admin, variables) => {
    const response = await admin.graphql(
        `#graphql
        mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
            metafields {
                key
                namespace
                value
                createdAt
                updatedAt
            }
            userErrors {
                field
                message
                code
            }
            }
        }`,
        {
          variables: variables
          
        },
      );
    const data = await response.json();
    return data;
};

export const getMetafield = async (admin, variables) => {

};

