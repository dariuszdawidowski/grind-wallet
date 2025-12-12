export const idlFactory = ({ IDL }) => {
  const RewardToken = IDL.Record({
    'name' : IDL.Text,
    'probabilityPercent' : IDL.Nat,
    'symbol' : IDL.Text,
    'canisterId' : IDL.Principal,
  });
  const PrizeResult = IDL.Record({ 'token' : RewardToken, 'amount' : IDL.Nat });
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
  const User = IDL.Record({
    'username' : IDL.Text,
    'principalId' : IDL.Principal,
    'accountNumbers' : IDL.Vec(IDL.Text),
  });
  return IDL.Service({
    'clearErrorLogs' : IDL.Func([IDL.Opt(IDL.Int)], [IDL.Bool], []),
    'cyclesBalance' : IDL.Func([], [IDL.Nat], []),
    'drawPrize' : IDL.Func([], [IDL.Opt(PrizeResult)], []),
    'getCallerActivity' : IDL.Func(
        [],
        [
          IDL.Opt(
            IDL.Record({
              'canDrawAgainAt' : IDL.Int,
              'lastDrawTime' : IDL.Int,
              'totalDraws' : IDL.Nat,
            })
          ),
        ],
        ['query'],
      ),
    'getErrorLogs' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Int), IDL.Opt(IDL.Int)],
        [IDL.Vec(ErrorLog)],
        ['query'],
      ),
    'getNFTs' : IDL.Func([], [IDL.Vec(NFT)], ['query']),
    'getRateLimitConfig' : IDL.Func(
        [],
        [
          IDL.Record({
            'minDrawIntervalNanos' : IDL.Int,
            'maxDrawsPerCaller' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getRewardTokens' : IDL.Func([], [IDL.Vec(RewardToken)], ['query']),
    'getTokens' : IDL.Func([], [IDL.Vec(Token)], ['query']),
    'getUsername' : IDL.Func([IDL.Text], [IDL.Opt(User)], ['query']),
    'getUsersCount' : IDL.Func([], [IDL.Nat], ['query']),
    'setMaxDrawsPerCaller' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'setMinDrawInterval' : IDL.Func([IDL.Int], [IDL.Bool], []),
    'setUsername' : IDL.Func([IDL.Text, IDL.Vec(IDL.Text)], [IDL.Bool], []),
    'writeErrorLog' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Opt(IDL.Int)],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
