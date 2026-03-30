
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class FinanceHub : Hub 
{
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("ReceiveConnectionId", Context.ConnectionId);
        await base.OnConnectedAsync();
    }
}