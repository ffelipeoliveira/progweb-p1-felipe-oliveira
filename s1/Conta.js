// s1/Conta.js — v2: encapsulamento
export class Conta {
  #saldo = 0; // campo privado: só o código DENTRO desta classe enxerga
  #titular;

  constructor(numero, titular) {
    if (new.target === Conta) {
      throw new Error('Conta é abstrata: crie ContaCorrente ou ContaPoupanca');
    }
    this.numero = numero;
    this.titular = titular; // passa pelo setter abaixo
  }

  // getter: leitura liberada. Não há setter: escrever, só por depositar/sacar
  get saldo() {
    return this.#saldo;
  }

  saldoDisponivel() {
    return this.#saldo
  }

  get titular() {
    return this.#titular;
  }

  // setter: escrita liberada, mas com regra
  set titular(nome) {
    if (typeof nome !== 'string' || nome.trim().length < 3) {
      throw new Error('Titular inválido');
    }
    this.#titular = nome.trim();
  }

  depositar(valor) {
    if (!(valor > 0)) throw new Error('Depósito deve ser positivo');
    this.#saldo += valor;
  }

  sacar(valor) {
    if (!(valor > 0)) throw new Error('Saque deve ser positivo');
    if (valor > this.saldoDisponivel()) throw new Error('Saldo insuficiente');
    this.#saldo -= valor;
  }

  tarifaMensal() {
    throw new Error('tarifaMensal() precisa ser implementado na subclasse');
  }

  toString() {
    return `${this.constructor.name} ${this.numero} · ${this.titular} · R$ ${this.saldo.toFixed(2)}`;
  }
}
