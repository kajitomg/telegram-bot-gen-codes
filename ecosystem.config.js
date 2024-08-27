module.exports = {
  apps : [{
    script: 'dist/bundle.js',
    watch: '.',
    error_file: 'path/to/error.log',
    out_file: 'path/to/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};