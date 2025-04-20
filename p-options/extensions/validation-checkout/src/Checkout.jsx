import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useApplyAttributeChange,
  useExtensionCapability,
  useInstructions,
  useBuyerJourneyIntercept,
  TextField,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.contact.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  const ageTarget = 18;

  const [age, setAge] = useState("");
  const [validationError, setValidationError] = useState("");

  const canBlockProgress = useExtensionCapability("block_progress");
  const label = canBlockProgress ? "Age" : "Age(Optional)";

  useBuyerJourneyIntercept((canBlockProgress) => {
    if(canBlockProgress && ! isSetAge()){
      return {
        behavior: "block",
        reason: "Age is required",
        perform: (result) => {
          if(result.behavior == "block"){
            setValidationError("Enter your age");
          }
        }
      }
    }
    return {
      behavior: "allow",
      perform: () => {
        clearErrorInfo();
      }
    }
  });


  function isSetAge(){
    return age !== "";
  }
  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="validation-checkout" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  function clearErrorInfo(){
    setValidationError("");
  }

  // 3. Render a UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Banner title="validation-checkout">
        {translate("welcome", {
          target: <Text emphasis="italic">{extension.target}</Text>,
        })}
      </Banner>
      
      <Checkbox onChange={onCheckboxChange}>
        {translate("iWouldLikeAFreeGiftWithMyOrder")}
      </Checkbox>
      <TextField
        label={label}
        type="number"
        onChange={setAge}
        onInput={clearErrorInfo}
        required={canBlockProgress}
        error={validationError}
      />
    </BlockStack>
    
  );

  async function onCheckboxChange(isChecked) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}