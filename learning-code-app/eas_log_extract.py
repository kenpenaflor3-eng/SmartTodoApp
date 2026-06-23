import urllib.request, gzip, pathlib
url = 'https://storage.googleapis.com/eas-workflows-production/logs/5d191012-47ca-4c40-8d4d-f6fe2df10b2f/56936c8a-e48e-460f-a3ee-eee0ae83209e/2026-06-23T11%3A49%3A43Z-1d4d48de-fcd0-4a8f-acc7-833da3a15548.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260623%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260623T115111Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=3c4a28041e152eb2fd1ca201557781e944c40d287f15e422549422f66ec4a0991395aac04a20374fe2c5fa6319185c899725d4adfe6e485a4a657058ad5924164f249e2842f140e3b721de97ffffdffb73661e1e62d659da7b8df729bee24a45fd54e03bda20e0f647069c3753bedecd12750e854f494f827b333c200a99f8396470f321705c60e475e55e22033b06c059f9462a478ede3dee1366bfa535417eae7c5daf61ceae69c66bf98d68c4539319a93648f1ab727da78a9aecd0118a3a059eb498008c150233fd72a35382f07bcb3aa161b5d5954c28cb4f256542b415b5555371c44bb377475be8971ad1c08a5a80e06b5a50ce2e9'
data = urllib.request.urlopen(url).read()
pathlib.Path('eas_log.bin').write_bytes(data)
print('len', len(data), 'head', data[:4])
if data[:2] == b'\x1f\x8b':
    print('gzip')
    text = gzip.decompress(data).decode('utf-8', errors='replace')
    print(text[-2000:])
else:
    try:
        print(data.decode('utf-8')[-2000:])
    except Exception as e:
        print('decode failed', e)
