export const idlFactory = ({ IDL }) => {
  const ErrorLog = IDL.Record({
    'clientId' : IDL.Text,
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  const NFT = IDL.Record({
    'name' : IDL.Text,
    'collection_canister_id' : IDL.Principal,
    'standard' : IDL.Text,
  });
  const Token = IDL.Record({
    'name' : IDL.Text,
    'index_canister_id' : IDL.Opt(IDL.Principal),
    'ledger_canister_id' : IDL.Principal,
    'symbol' : IDL.Text,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'status_code' : IDL.Nat16,
  });
  return IDL.Service({
    'cyclesBalance' : IDL.Func([], [IDL.Nat], []),
    'getErrorLogs' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Int), IDL.Opt(IDL.Int)],
        [IDL.Vec(ErrorLog)],
        ['query'],
      ),
    'getNFTs' : IDL.Func([], [IDL.Vec(NFT)], ['query']),
    'getTokens' : IDL.Func([], [IDL.Vec(Token)], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'writeErrorLog' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Int)],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
