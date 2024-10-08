import { Component } from '../Boost.js';
import { formatWithSpaces, formatCurrency } from '../utils/Currency.js';
import { icpLedgerBalance, icpLedgerTransfer } from '../utils/Transactions.js';
import { formatE8S } from '../utils/Currency.js';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as ledgerIdlFactory } from '../did/ledger_canister.did.js';

export class Card extends Component {

    constructor(args) {
        super(args);

        // Identity
        this.identity = args.identity;
        console.log('ID', this.identity._principal)
        this.principal = args.principal;
        this.account = args.account;
        this.balance = null;

        this.app.icp.agent = new HttpAgent({ host: 'https://icp-api.io', caller: args.identity}, args.identity);
        this.app.icp.agent.fetchRootKey().catch((err) => {
            console.warn("Unable to fetch root key.");
            console.error(err);
        });
        this.app.icp.ledger.actor = Actor.createActor(ledgerIdlFactory, { agent: this.app.icp.agent, canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai' });

        // Build
        this.element.id = args.id;
        this.element.classList.add('card');
        this.element.innerHTML = `
            <div class="name">${args.name}</div>
            <div class="subname">CRYPTOCURRENCY WALLET</div>
            <div class="currency">ICP</div>
            <div class="amount">Fetching...</div>
            <div class="account1">${formatWithSpaces(args.account.substring(0, 24), 4)}</div>
            <div class="account2">${formatWithSpaces(args.account.substring(24), 4)}</div>
            <img class="logo" src="${args.logo}">
            <div class="open">
                Click to open
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="7" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                    <rect x="7" y="3" width="14" height="14" fill="none" stroke="white" stroke-width="2"/>
                </svg>
            </div>
        `;

        // Events
        this.event.on({
            id: `card:${this.element.id}`,
            type: 'click',
            //callback: args.click
            callback: () => {
                console.log('TRANSFER')
                icpLedgerTransfer(
                    this.app.icp.ledger.actor,
                    '...principal...',
                    '...account...'
                ).then(result => console.log(result));
            }
        });

        // Fetch balance
        icpLedgerBalance(this.app.icp.ledger.actor, this.account).then(balance => {
            this.balance = balance;
            this.element.querySelector('.amount').innerHTML = formatE8S(this.balance);
        });
        

    }

}
