export const idlFactory = ({ IDL }) => {
    const AccountIdentifier = IDL.Text;
    const SubAccount = IDL.Vec(IDL.Nat8);
    const TokenIndex = IDL.Nat32;
    const Settlement = IDL.Record({
      'subaccount' : SubAccount,
      'seller' : IDL.Principal,
      'buyer' : AccountIdentifier,
      'price' : IDL.Nat64,
    });
    const TokenIdentifier = IDL.Text;
    const AccountIdentifier__1 = IDL.Text;
    const User = IDL.Variant({
      'principal' : IDL.Principal,
      'address' : AccountIdentifier__1,
    });
    const BalanceRequest = IDL.Record({
      'token' : TokenIdentifier,
      'user' : User,
    });
    const Balance = IDL.Nat;
    const CommonError__1 = IDL.Variant({
      'InvalidToken' : TokenIdentifier,
      'Other' : IDL.Text,
    });
    const BalanceResponse = IDL.Variant({
      'ok' : Balance,
      'err' : CommonError__1,
    });
    const TokenIdentifier__1 = IDL.Text;
    const CommonError = IDL.Variant({
      'InvalidToken' : TokenIdentifier,
      'Other' : IDL.Text,
    });
    const Result_7 = IDL.Variant({
      'ok' : AccountIdentifier,
      'err' : CommonError,
    });
    const Time = IDL.Int;
    const Listing = IDL.Record({
      'locked' : IDL.Opt(Time),
      'seller' : IDL.Principal,
      'price' : IDL.Nat64,
    });
    const Result_9 = IDL.Variant({
      'ok' : IDL.Tuple(AccountIdentifier, IDL.Opt(Listing)),
      'err' : CommonError,
    });
    const EXTMetadataValue = IDL.Tuple(
      IDL.Text,
      IDL.Variant({
        'nat' : IDL.Nat,
        'blob' : IDL.Vec(IDL.Nat8),
        'nat8' : IDL.Nat8,
        'text' : IDL.Text,
      }),
    );
    const EXTMetadataContainer = IDL.Variant({
      'blob' : IDL.Vec(IDL.Nat8),
      'data' : IDL.Vec(EXTMetadataValue),
      'json' : IDL.Text,
    });
    const EXTMetadata = IDL.Variant({
      'fungible' : IDL.Record({
        'decimals' : IDL.Nat8,
        'metadata' : IDL.Opt(EXTMetadataContainer),
        'name' : IDL.Text,
        'symbol' : IDL.Text,
      }),
      'nonfungible' : IDL.Record({
        'thumbnail' : IDL.Text,
        'asset' : IDL.Text,
        'metadata' : IDL.Opt(EXTMetadataContainer),
        'name' : IDL.Text,
      }),
    });
    const Result_8 = IDL.Variant({ 'ok' : EXTMetadata, 'err' : CommonError });
    const Extension = IDL.Text;
    const Metadata = IDL.Variant({
      'fungible' : IDL.Record({
        'decimals' : IDL.Nat8,
        'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
        'name' : IDL.Text,
        'symbol' : IDL.Text,
      }),
      'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)) }),
    });
    const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
    const HttpRequest = IDL.Record({
      'url' : IDL.Text,
      'method' : IDL.Text,
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(HeaderField),
    });
    const HttpStreamingCallbackToken = IDL.Record({
      'key' : IDL.Text,
      'sha256' : IDL.Opt(IDL.Vec(IDL.Nat8)),
      'index' : IDL.Nat,
      'content_encoding' : IDL.Text,
    });
    const HttpStreamingCallbackResponse = IDL.Record({
      'token' : IDL.Opt(HttpStreamingCallbackToken),
      'body' : IDL.Vec(IDL.Nat8),
    });
    const HttpStreamingStrategy = IDL.Variant({
      'Callback' : IDL.Record({
        'token' : HttpStreamingCallbackToken,
        'callback' : IDL.Func(
            [HttpStreamingCallbackToken],
            [HttpStreamingCallbackResponse],
            ['query'],
          ),
      }),
    });
    const HttpResponse = IDL.Record({
      'body' : IDL.Vec(IDL.Nat8),
      'headers' : IDL.Vec(HeaderField),
      'streaming_strategy' : IDL.Opt(HttpStreamingStrategy),
      'status_code' : IDL.Nat16,
    });
    const ListRequest = IDL.Record({
      'token' : TokenIdentifier__1,
      'from_subaccount' : IDL.Opt(SubAccount),
      'price' : IDL.Opt(IDL.Nat64),
    });
    const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : CommonError });
    const Result_6 = IDL.Variant({ 'ok' : Metadata, 'err' : CommonError });
    const MintingRequest = IDL.Record({
      'to' : AccountIdentifier,
      'asset' : IDL.Nat32,
    });
    const Result_5 = IDL.Variant({
      'ok' : IDL.Tuple(AccountIdentifier, IDL.Nat64),
      'err' : IDL.Text,
    });
    const Result_4 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
    const SaleTransaction = IDL.Record({
      'time' : Time,
      'seller' : IDL.Principal,
      'tokens' : IDL.Vec(TokenIndex),
      'buyer' : AccountIdentifier,
      'price' : IDL.Nat64,
    });
    const SaleSettings = IDL.Record({
      'startTime' : Time,
      'whitelist' : IDL.Bool,
      'totalToSell' : IDL.Nat,
      'sold' : IDL.Nat,
      'bulkPricing' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat64)),
      'whitelistTime' : Time,
      'salePrice' : IDL.Nat64,
      'remaining' : IDL.Nat,
      'price' : IDL.Nat64,
    });
    const Sale = IDL.Record({
      'expires' : Time,
      'subaccount' : SubAccount,
      'tokens' : IDL.Vec(TokenIndex),
      'buyer' : AccountIdentifier,
      'price' : IDL.Nat64,
    });
    const Balance__1 = IDL.Nat;
    const Result_2 = IDL.Variant({ 'ok' : Balance__1, 'err' : CommonError });
    const Result_1 = IDL.Variant({
      'ok' : IDL.Vec(TokenIndex),
      'err' : CommonError,
    });
    const Result = IDL.Variant({
      'ok' : IDL.Vec(
        IDL.Tuple(TokenIndex, IDL.Opt(Listing), IDL.Opt(IDL.Vec(IDL.Nat8)))
      ),
      'err' : CommonError,
    });
    const Transaction = IDL.Record({
      'token' : TokenIdentifier__1,
      'time' : Time,
      'seller' : IDL.Principal,
      'buyer' : AccountIdentifier,
      'price' : IDL.Nat64,
    });
    const Memo = IDL.Vec(IDL.Nat8);
    const SubAccount__1 = IDL.Vec(IDL.Nat8);
    const TransferRequest = IDL.Record({
      'to' : User,
      'token' : TokenIdentifier,
      'notify' : IDL.Bool,
      'from' : User,
      'memo' : Memo,
      'subaccount' : IDL.Opt(SubAccount__1),
      'amount' : Balance,
    });
    const TransferResponse = IDL.Variant({
      'ok' : Balance,
      'err' : IDL.Variant({
        'CannotNotify' : AccountIdentifier__1,
        'InsufficientBalance' : IDL.Null,
        'InvalidToken' : TokenIdentifier,
        'Rejected' : IDL.Null,
        'Unauthorized' : AccountIdentifier__1,
        'Other' : IDL.Text,
      }),
    });
    return IDL.Service({
      'acceptCycles' : IDL.Func([], [], []),
      'addAsset' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
      'addThumb' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
      'adminKillHeartbeat' : IDL.Func([], [], []),
      'adminKillHeartbeatExtra' : IDL.Func([IDL.Text], [], []),
      'adminRefund' : IDL.Func(
          [IDL.Text, AccountIdentifier, AccountIdentifier],
          [IDL.Text],
          [],
        ),
      'adminStartHeartbeat' : IDL.Func([], [], []),
      'adminStartHeartbeatExtra' : IDL.Func([IDL.Text], [], []),
      'allPayments' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Vec(SubAccount)))],
          ['query'],
        ),
      'allSettlements' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(TokenIndex, Settlement))],
          ['query'],
        ),
      'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
      'balance' : IDL.Func([BalanceRequest], [BalanceResponse], ['query']),
      'bearer' : IDL.Func([TokenIdentifier__1], [Result_7], ['query']),
      'clearPayments' : IDL.Func([IDL.Principal, IDL.Vec(SubAccount)], [], []),
      'cronCapEvents' : IDL.Func([], [], []),
      'cronDisbursements' : IDL.Func([], [], []),
      'cronSalesSettlements' : IDL.Func([], [], []),
      'cronSettlements' : IDL.Func([], [], []),
      'details' : IDL.Func([TokenIdentifier__1], [Result_9], ['query']),
      'ext_metadata' : IDL.Func([TokenIdentifier__1], [Result_8], ['query']),
      'ext_metadataGetArray' : IDL.Func(
          [IDL.Nat, IDL.Nat],
          [IDL.Vec(IDL.Tuple(TokenIndex, EXTMetadata))],
          ['query'],
        ),
      'ext_metadataSetArray' : IDL.Func(
          [IDL.Vec(IDL.Tuple(TokenIndex, EXTMetadata))],
          [],
          ['oneway'],
        ),
      'ext_metadataSetSingle' : IDL.Func(
          [TokenIndex, EXTMetadata],
          [],
          ['oneway'],
        ),
      'ext_metadatabyindex' : IDL.Func([TokenIndex], [Result_8], ['query']),
      'extensions' : IDL.Func([], [IDL.Vec(Extension)], ['query']),
      'failedSales' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(AccountIdentifier, SubAccount))],
          ['query'],
        ),
      'getAssets' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
          ['query'],
        ),
      'getMinter' : IDL.Func([], [IDL.Principal], ['query']),
      'getRegistry' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier))],
          ['query'],
        ),
      'getTokens' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(TokenIndex, Metadata))],
          ['query'],
        ),
      'heartbeat_external' : IDL.Func([], [], []),
      'heartbeat_pending' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
          ['query'],
        ),
      'historicExport' : IDL.Func([], [IDL.Bool], []),
      'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
      'http_request_streaming_callback' : IDL.Func(
          [HttpStreamingCallbackToken],
          [HttpStreamingCallbackResponse],
          ['query'],
        ),
      'initCap' : IDL.Func([], [], []),
      'isHeartbeatRunning' : IDL.Func([], [IDL.Bool], ['query']),
      'list' : IDL.Func([ListRequest], [Result_3], []),
      'listings' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(TokenIndex, Listing, Metadata))],
          ['query'],
        ),
      'lock' : IDL.Func(
          [TokenIdentifier__1, IDL.Nat64, AccountIdentifier, SubAccount],
          [Result_7],
          [],
        ),
      'metadata' : IDL.Func([TokenIdentifier__1], [Result_6], ['query']),
      'mintNFT' : IDL.Func([MintingRequest], [TokenIndex], []),
      'payments' : IDL.Func([], [IDL.Opt(IDL.Vec(SubAccount))], ['query']),
      'pendingCronJobs' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['query']),
      'reserve' : IDL.Func(
          [IDL.Nat64, IDL.Nat64, AccountIdentifier, SubAccount],
          [Result_5],
          [],
        ),
      'retreive' : IDL.Func([AccountIdentifier], [Result_4], []),
      'saleTransactions' : IDL.Func([], [IDL.Vec(SaleTransaction)], ['query']),
      'salesSettings' : IDL.Func([AccountIdentifier], [SaleSettings], ['query']),
      'salesSettlements' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(AccountIdentifier, Sale))],
          ['query'],
        ),
      'setMinter' : IDL.Func([IDL.Principal], [], []),
      'settle' : IDL.Func([TokenIdentifier__1], [Result_3], []),
      'settlements' : IDL.Func(
          [],
          [IDL.Vec(IDL.Tuple(TokenIndex, AccountIdentifier, IDL.Nat64))],
          ['query'],
        ),
      'stats' : IDL.Func(
          [],
          [IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat64, IDL.Nat, IDL.Nat, IDL.Nat],
          ['query'],
        ),
      'supply' : IDL.Func([TokenIdentifier__1], [Result_2], ['query']),
      'tokens' : IDL.Func([AccountIdentifier], [Result_1], ['query']),
      'tokens_ext' : IDL.Func([AccountIdentifier], [Result], ['query']),
      'transactions' : IDL.Func([], [IDL.Vec(Transaction)], ['query']),
      'transfer' : IDL.Func([TransferRequest], [TransferResponse], []),
      'viewDisbursements' : IDL.Func(
          [],
          [
            IDL.Vec(
              IDL.Tuple(TokenIndex, AccountIdentifier, SubAccount, IDL.Nat64)
            ),
          ],
          ['query'],
        ),
    });
  };
  export const init = ({ IDL }) => { return []; };