:: `gitbook serve` can break with permission issues on Windows for misc.
:: machines. This script is a workaround. When `gitbook serve` fails, it silently
:: restarts it.
:: https://github.com/GitbookIO/gitbook/issues/1379#issuecomment-288048275
@Echo off
:Start
call gitbook serve
goto Start