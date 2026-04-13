module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'style', 'docs', 'refactor', 'chore']],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never']
  }
};
