/**
 * callbackUrl: /api/callback
 * @param {*} admin 
 * @param {*} webhookSubscription 
 * @returns 
 */
export const createWebhooks = async (admin, topic, webhookSubscription) => {
    const response = await admin.graphql(
        `#graphql
  mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      webhookSubscription {
        id
        topic
        filter
        format
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
        {
          variables: {
            "topic": topic,
            "webhookSubscription": webhookSubscription
          }
          
        },
      );
    const data = await response.json();
    return data;
};


export const createCartCreateHook = async (admin, webhookSubscription) => {
    return this.createWebhooks(admin, "CARTS_CREATE", webhookSubscription);
};

export const createCartUpdateHook = async (admin, webhookSubscription) => {
  return this.createWebhooks(admin, "CARTS_UPDATE", webhookSubscription);
};