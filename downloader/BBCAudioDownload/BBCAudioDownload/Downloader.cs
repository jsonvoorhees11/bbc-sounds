using BBCAudioDownload.Constants;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace BBCAudioDownload
{
    public class Downloader
    {
        private readonly RestClient _restClient;
        private readonly IEnumerable<Podcast> _podcasts;
        public Downloader()
        {
            HttpClient client = new HttpClient();
            _restClient = new RestClient(client);
        }
        public Downloader(IEnumerable<Podcast> podcasts) : this()
        {
            _podcasts = podcasts;
        }

        public async Task DownloadPodcastsAsync()
        {
            foreach (var brand in _podcasts)
            {
                Console.WriteLine("Starting to get series " + brand.BrandId);
                var directoryPath = Path.Combine(Paths.AudioStoragePath, brand.BrandId);
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }
                foreach (var track in brand.Tracks)
                {
                    var parts = track.Url.Split("/");
                    var fileName = parts[parts.Length - 1] + ".mp3";
                    var filePath = Path.Combine(directoryPath, fileName);
                    if (Directory.Exists(filePath))
                    {
                        continue;
                    }
                    Console.WriteLine("     Starting to get " + fileName);
                    await Download("http:" + track.DownloadLink, filePath);
                    Console.WriteLine("     Done getting " + fileName);

                }
                Console.WriteLine("Done getting series " + brand.BrandId);
            }
        }

        private async Task Download(string url, string filePath)
        {
            var headers = new Dictionary<string, string>();
            byte[] fileBytes = await _restClient.GetFileAsync(url, headers);
            await File.WriteAllBytesAsync(filePath, fileBytes);
        }

    }
}
