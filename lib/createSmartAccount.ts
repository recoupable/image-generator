import { CdpClient } from "@coinbase/cdp-sdk";

const cdp = new CdpClient();

const createSmartAccount = async () => {
  const evmAccount = await cdp.evm.createAccount();
  const smartAccount = await cdp.evm.createSmartAccount({
    owner: evmAccount,
  });
  return smartAccount;
};

export default createSmartAccount;
