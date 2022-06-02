/// <reference types="cypress" />

import contrato from '../contracts/produtos.contract.js'

describe('Teste da Funcionalidade Produtos', () => {

    let token
    before(() => {
        cy.token("fulano@qa.com", "teste").then(tkn => { token = tkn })
    });

    it('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar produtos', () => {

        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            expect(response.status).to.equal(200)
            // expect(response.body.produtos[1].nome).to.equal("Samsung 60 polegadas")
            expect(response.body).to.have.property('produtos')
            expect(response.body).to.have.property('quantidade')
            expect(response.duration).to.be.lessThan(25)
        });
    });

    it('Cadastrar produto', () => {

        let nomeDoProduto = `[${Math.floor(Math.random() * 10000)}] - Produto lgc2`

        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": nomeDoProduto,
                "preco": 500,
                "descricao": "Suporte para smartphone",
                "quantidade": 300
            },
            headers: {
                Authorization: token
            }
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal("Cadastro realizado com sucesso")
        });
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        let nomeDoProduto = `[${Math.floor(Math.random() * 10000)}] - Produto lgc2`
        let preco = 300
        let descricao = "Suporte para smartphone"
        let quantidade = 150

        cy.cadastrarProduto(token, nomeDoProduto, preco, descricao, quantidade)
            .then((response) => {
                expect(response.status).to.equal(201)
            })

        cy.cadastrarProduto(token, nomeDoProduto, preco, descricao, quantidade)
            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal("Já existe produto com esse nome")
            });
    });

    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos').then((response) => { // como é um GET, pode passar o path/URL diretamente
            let id = response.body.produtos[1]._id

            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: { authorization: token },
                body: {
                    "nome": `Produto editado ${Math.floor(Math.random() * 10000)}X`,
                    "preco": 470,
                    "descricao": "Mouse",
                    "quantidade": 381
                }
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.message).to.equal("Registro alterado com sucesso")
            })
        })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let nomeDoProduto = `[${Math.floor(Math.random() * 10000)}] - Produto lgc2`
        let preco = 150
        let descricao = "Suporte para smartphone"
        let quantidade = 100

        cy.cadastrarProduto(token, nomeDoProduto, preco, descricao, quantidade)
            .then((response) => {
                expect(response.status).to.equal(201)

                let idDoProduto = response.body._id
                cy.request({
                    method: 'PUT',
                    url: `produtos/${idDoProduto}`,
                    headers: { authorization: token },
                    body: {
                        "nome": nomeDoProduto,
                        "preco": 470,
                        "descricao": "Mouse",
                        "quantidade": 381
                    }
                }).then((response) => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal("Registro alterado com sucesso")
                });
            });
    });

    it('Deve deletar um produto previamente cadastrado', () => {
        let nomeDoProduto = `[${Math.floor(Math.random() * 10000)}] - Produto lgc2`
        let preco = 150
        let descricao = "Suporte para smartphone"
        let quantidade = 100

        cy.cadastrarProduto(token, nomeDoProduto, preco, descricao, quantidade)
            .then((response) => {
                expect(response.status).to.equal(201)

                let idDoProduto = response.body._id
                cy.request({
                    method: 'DELETE',
                    url: `produtos/${idDoProduto}`,
                    headers: { authorization: token }
                }).then((response) => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal("Registro excluído com sucesso")
                });
            });
    });
});