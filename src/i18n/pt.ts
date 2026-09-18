// Portuguese (Brazil) translations
export const ptBR = {
  nav: { book: "Reservar", flights: "Voos", myBooking: "Minha reserva" },
  home: { hero: "Sua jornada começa aqui", popularDestinations: "Destinos populares" },
  search: {
    from: "De", to: "Para", date: "Data", passengers: "Passageiros",
    searchFlights: "Buscar voos", searching: "Buscando...", adult: "Adulto", adults: "Adultos",
    cabinClass: { economy: "Econômica", premium_economy: "Econômica Premium", business: "Executiva", first: "Primeira classe" },
  },
  flights: {
    title: "Voos disponíveis", noResults: "Nenhum voo encontrado", filters: "Filtros",
    cabinClass: "Classe da cabine", allClasses: "Todas as classes", nonStop: "Voo direto", select: "Selecionar",
    status: { scheduled: "Agendado", boarding: "Embarcando", departed: "Partiu", arrived: "Chegou", cancelled: "Cancelado" },
  },
  booking: {
    cabin: { title: "Selecionar classe", selectFrom: "Selecionar de", soldOut: "Esgotado" },
    seat: { title: "Selecionar assento", selected: "Assento selecionado", available: "Disponível", occupied: "Ocupado", yourSeat: "Seu assento" },
    passenger: { title: "Informações do passageiro", passengerN: "Passageiro", title_field: "Título", firstName: "Nome", lastName: "Sobrenome", dateOfBirth: "Data de nascimento", nationality: "Nacionalidade", passportNumber: "Número do passaporte" },
    contact: { title: "Informações de contato", subtitle: "A confirmação será enviada para este contato.", firstName: "Nome", lastName: "Sobrenome", email: "Endereço de e-mail", phone: "Número de telefone" },
    summary: { title: "Resumo da reserva", flight: "Voo", cabin: "Classe", seat: "Assento", passenger: "Passageiro", contact: "Contato", total: "Total", confirmAndPay: "Confirmar e pagar" },
    payment: { title: "Pagamento", cardNumber: "Número do cartão", expiry: "Validade", cvv: "CVV", name: "Nome no cartão", payNow: "Pagar agora", processing: "Processando..." },
    confirmation: { title: "Reserva confirmada!", subtitle: "Seu voo está pronto. Faça as malas!", reference: "Referência da reserva", downloadTicket: "⬇ Baixar e-ticket", backHome: "Voltar ao início" },
  },
  common: { back: "← Voltar", next: "Próximo →", loading: "Carregando...", error: "Ocorreu um erro", close: "Fechar" },
  locale: { language: "Idioma", currency: "Moeda", currentLanguage: "Idioma atual", allLanguages: "Todos os idiomas", popularCurrencies: "Moedas populares", allCurrencies: "Todas as moedas" },
};

// Portuguese (Portugal) translations
export const ptPT = {
  ...ptBR,
  nav: { book: "Reservar", flights: "Voos", myBooking: "A minha reserva" },
  home: { hero: "A sua viagem começa aqui", popularDestinations: "Destinos populares" },
  search: {
    ...ptBR.search,
    searchFlights: "Pesquisar voos", searching: "A pesquisar...",
    cabinClass: { economy: "Económica", premium_economy: "Económica Premium", business: "Executiva", first: "Primeira classe" },
  },
  common: { back: "← Voltar", next: "Seguinte →", loading: "A carregar...", error: "Ocorreu um erro", close: "Fechar" },
};
