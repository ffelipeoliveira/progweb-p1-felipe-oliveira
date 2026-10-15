# Modelagem — Projeto 1

**Aluno(a):** Francisco Felipe Vieira de Oliveira  
**Domínio:** Calculadora e Banco de Impressões, Modelos e Materiais para Impressões 3D

## 1. O domínio

A partir do custo de material, tipo de material e tempo de impressão de um modelo 3D é possível gerenciar preços e disponibilidade de impressoras e embalagens e manter a oficina funcionando eficientemente.

## 2. Entidades

| Entidade | Atributos | Relacionamentos |
|---|---|---|
| Impressora | id, modelo, marca, areaDeImpressao | responsável por realizar impressões |
| Material | id, tipo, marca, preco | consumido na impressão |
| Modelo3D | id, peso, tamanho, tempoDeImpressao | modelo usado para impressões |
| Impressao | id, custo, tamanho | impressão finalizada |
| Embalagem | id, custo, tamanho, opcionais | embalagem para embalar a impressão |
| Venda | id, preco, custo, lucro | venda finalizada

## 3. Diagrama de classes

```mermaid
classDiagram
  direction LR

  class Impressora {
    +id
    +modelo
    +marca
    +areaDeImpressao
  }
  class Material {
    +id
    +tipo
    +marca
    +preco
    +qtdEmGramas
  }
  class Modelo3D {
    +id
    +peso
    +tamanho
    +arquivo
  }
  class Embalagem {
    +id
    +custo
    +tamanho
    +opcionais
  }

  class Impressao {
    +id
    +custo
    +tamanho
  }

  class Venda {
    +id
    +descrição
    +preco
  }

  class MaterialRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(material)
  }

  class Modelo3DRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(modelo3D)
  }

  class EmbalagemRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(embalagem)
  }

  class ImpressoraRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(impressora)
  }

  class ImpressaoRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(impressao)
  }

  class VendaRepository {
    <<contrato>>
    +buscarPorId(id)
    +listar()
    +salvar(venda)
  }

  class ImprimirService {
    +calcularCustoDeImpressao(Modelo3DId, MaterialId)
    +calcularOndeImprimir(Modelo3DId, ImpressoraRepository)
  }

  class VenderService {
    calcularEmbalagem(ImpressaoId, EmbalagemRepository)
    +calcularCustoDaVenda(ImpressaoId, calcularEmbalagem)
    +calcularPrecoDaVenda(calcularCustoDaVenda, margemDeLucro)
  }

  Material "1..*" --> "0..*" ImprimirService : consumido em
  Impressora "1" --> "0..*" ImprimirService : faz
  Modelo3D "1" --> "0..*" ImprimirService : usado em
  ImprimirService "1" --> "1" Impressao : cria

  Impressao "1..*" --> "1" VenderService : vendido em
  Embalagem "1" --> "1" VenderService : usado em
  VenderService "1" --> "1" Venda : cria

  Material "0..*" <--> "1" MaterialRepository
  Impressora "0..*" <--> "1" ImpressoraRepository
  Modelo3D "0..*" <--> "1" Modelo3DRepository
  Impressao "0..*" <--> "1" ImpressaoRepository
  Embalagem "0..*" <--> "1" EmbalagemRepository
  Venda "0..*" <--> "1" VendaRepository


```

## 4. Responsabilidades

| Classe | Papel | Único motivo para mudar |
|---|---|---|
| Material, Impressora, Modelo3D, Impressao, Embalagem, Venda | entidades | as regras do próprio objeto |
| ImprimirService, VenderService | regra de negócio | o processo de imprimir e vender |
| MaterialRepository, ImpressoraRepository, Modelo3DRepository, ImpressaoRepository, EmbalagemRepository, VendaRepository | acesso aos dados | a forma de guardar (memória na S3, SQLite na S5) |

## 5. Onde apliquei SRP e DIP

- **SRP:** nenhuma entidade salva a si mesma nem envia e-mail. Guardar é papel dos
  repositories; os processos ficam no ImprimirService e VenderService.
- **DIP:** ImprimirService e VenderService depende dos contratos dos repositories recebidos pelo construtor. Ele não sabe se os dados estão em memória ou em um banco.

## 6. Fora do escopo (YAGNI)

Devoluções e falhas de impressão não entram no Projeto 1.
