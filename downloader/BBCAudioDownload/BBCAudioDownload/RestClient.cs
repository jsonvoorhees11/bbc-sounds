using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace BBCAudioDownload
{
    public class RestClient
    {
        private readonly HttpClient _client;
        public RestClient(HttpClient httpClient)
        {
            _client = httpClient;
        }
        public async Task<byte[]> GetFileAsync(string url, Dictionary<string,string> headers)
        {
            var uri = new Uri(url);
            _client.DefaultRequestHeaders.Accept.Clear();
            foreach (var item in headers)
            {
                if (_client.DefaultRequestHeaders.Contains(item.Key))
                {
                    _client.DefaultRequestHeaders.Remove(item.Key);
                }
                _client.DefaultRequestHeaders.Add(item.Key, item.Value);
            }
            var response = await _client.GetAsync(uri);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }
            var result = await response.Content.ReadAsByteArrayAsync();
            return result;
        }
    }
}
