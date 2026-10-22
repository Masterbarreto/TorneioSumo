import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('LGPD Modal & Terms Logic', () => {
  it('deve exigir consentimento explícito antes de submeter criação de conta', () => {
    const registrationState = {
      name: 'Competidor Robótica',
      email: 'competidor@senac.edu.br',
      password: 'senhaSegura123!',
      lgpdAccepted: false,
    };

    const validateSubmission = (state) => {
      if (!state.lgpdAccepted) {
        return { canSubmit: false, reason: 'LGPD_MODAL_REQUIRED' };
      }
      return { canSubmit: true };
    };

    const initialCheck = validateSubmission(registrationState);
    assert.strictEqual(initialCheck.canSubmit, false);
    assert.strictEqual(initialCheck.reason, 'LGPD_MODAL_REQUIRED');

    // Usuário visualiza o popup modal e confirma os termos
    registrationState.lgpdAccepted = true;
    registrationState.lgpdAcceptedAt = new Date().toISOString();
    registrationState.lgpdVersion = '1.0';

    const postAcceptCheck = validateSubmission(registrationState);
    assert.strictEqual(postAcceptCheck.canSubmit, true);
  });

  it('deve montar payload de registro completo com CPF, Instituição e metadados LGPD', () => {
    const buildRegistrationPayload = (form, role, lgpdConsent) => {
      if (!lgpdConsent || !lgpdConsent.accepted) {
        throw new Error('É obrigatório aceitar os termos da LGPD.');
      }
      return {
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        cpf: form.cpf ? form.cpf.trim() : undefined,
        institution: form.institution ? form.institution.trim() : undefined,
        instituicao: form.institution ? form.institution.trim() : undefined,
        cargo: role === 'ADMIN' ? 'PROFESSOR' : 'ALUNO',
        lgpdAccepted: true,
        lgpdAcceptedAt: lgpdConsent.acceptedAt || new Date().toISOString(),
        lgpdVersion: lgpdConsent.version || '1.0',
      };
    };

    const payload = buildRegistrationPayload(
      {
        email: 'aluno.roboc@senac.edu.br',
        password: 'SenhaForte2026@',
        name: 'Roberto Carlos da Silva',
        cpf: '123.456.789-00',
        institution: 'SENAC Robotics Hub',
      },
      'ALUNO',
      { accepted: true, version: '1.0' }
    );

    assert.strictEqual(payload.lgpdAccepted, true);
    assert.strictEqual(payload.lgpdVersion, '1.0');
    assert.strictEqual(payload.cpf, '123.456.789-00');
    assert.strictEqual(payload.institution, 'SENAC Robotics Hub');
    assert.strictEqual(payload.cargo, 'ALUNO');
    assert.ok(payload.lgpdAcceptedAt);
  });

  it('deve configurar textos e rótulos contextuais para cada momento de abertura do modal', () => {
    const getModalConfig = (origin) => {
      switch (origin) {
        case 'login_click':
          return {
            title: 'Termos de Privacidade e Proteção de Dados (LGPD)',
            confirmText: 'Concordar e Prosseguir com o Cadastro',
            cancelText: 'Voltar ao Login',
          };
        case 'register_submit':
          return {
            title: 'Termos de Privacidade e Proteção de Dados',
            confirmText: 'Concordar e Criar Conta',
            cancelText: 'Voltar ao Formulário',
          };
        case 'privacy_menu':
          return {
            title: 'Política de Privacidade e LGPD',
            confirmText: 'Entendi e Concordo',
            cancelText: 'Fechar',
          };
        default:
          return {
            title: 'Termos de Privacidade e Proteção de Dados',
            confirmText: 'Concordar e Prosseguir',
            cancelText: 'Recusar e Voltar',
          };
      }
    };

    const loginCfg = getModalConfig('login_click');
    assert.strictEqual(loginCfg.confirmText, 'Concordar e Prosseguir com o Cadastro');

    const regCfg = getModalConfig('register_submit');
    assert.strictEqual(regCfg.confirmText, 'Concordar e Criar Conta');

    const privCfg = getModalConfig('privacy_menu');
    assert.strictEqual(privCfg.confirmText, 'Entendi e Concordo');
  });
});
